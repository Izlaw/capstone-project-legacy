<?php

namespace App\Http\Livewire;

use Livewire\Component;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OrderList extends Component
{
    public $orders; // All orders passed to the component.
    public $orderId = null; // Add this property to store orderId if provided

    protected $listeners = [
        'refreshStatus' => 'reloadOrders',
        'orderStatusUpdated' => 'handleOrderStatusUpdated',
        'priceUpdated' => 'handlePriceUpdated',
        'blurPrice' => 'savePrice',
    ];

    public $editing = null;
    public $newPrice = null;

    // Modify mount to accept an optional orderId parameter
    public function mount($orderId = null)
    {
        $this->orderId = $orderId;
        $this->reloadOrders();
    }

    public function editPrice($orderId)
    {
        $this->editing = $orderId;
        $this->newPrice = Order::find($orderId)->orderTotal;
    }

    public function savePrice($orderId = null)
    {
        // If no specific orderId is passed, use the currently edited one
        if ($orderId === null) {
            $orderId = $this->editing;
        }

        // Only proceed if we have an orderId to work with
        if ($orderId) {
            $this->validate([
                'newPrice' => 'required|numeric|min:0',
            ]);

            $order = Order::find($orderId);

            if ($order) {
                $order->orderTotal = $this->newPrice;
                $order->save();
                $this->editing = null;
                $this->emitSelf('priceUpdated', $orderId);

                // Dispatch browser event for JavaScript to show success message
                $this->dispatchBrowserEvent('price-updated', ['orderId' => $orderId]);
            } else {
                // Handle the case where the order is not found.
                Log::error("Order with ID $orderId not found.");
            }
        } else {
            // No order is being edited
            $this->editing = null;
        }
    }

    public function handlePriceUpdated($orderId)
    {
        Log::info("Price updated for order ID: $orderId");
        $this->reloadOrders();
    }

    public function reloadOrders()
    {
        // Log::info("Reloading orders", ['session_id' => session()->getId()]);

        $query = Order::with(['collection', 'customOrder', 'uploadOrder'])
            ->orderBy('orderID', 'desc');

        // If we have a specific orderId, filter by it
        if ($this->orderId) {
            $query->where('orderID', $this->orderId);
        }
        // If user is a customer, only show their orders
        elseif (auth()->check() && auth()->user()->role === 'customer') {
            $query->where('user_id', auth()->id());
        }

        $this->orders = $query->get();

        // Check for billing statement file existence for each order
        foreach ($this->orders as $order) {
            $fileName = 'Billing-Statement-' . $order->orderID . '.pdf';
            $billingFilePath = 'orders/billingstatements/' . $fileName;

            // Log the file path
            Log::info('Checking file path: ' .  $billingFilePath);

            // Check if the billing statement file exists
            $order->billingStatementExists = Storage::disk('public')->exists($billingFilePath);
        }
    }

    public function handleOrderStatusUpdated($orderId, $newStatus = null, $oldStatus = null)
    {
        Log::info("handleOrderStatusUpdated called", [
            'order_id'   => $orderId,
            'new_status' => $newStatus ?? 'Unknown',
            'old_status' => $oldStatus ?? 'N/A'
        ]);

        // Reload the orders to reflect the updated status in the table
        $this->reloadOrders();
        Log::info('reloadOrders fired');
    }

    public function render()
    {
        return view('livewire.order-list', ['orders' => $this->orders]);
    }
}
