<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class OrderStatusUpdatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $newStatus;
    public $oldStatus;
    public $customerName;

    /**
     * Create a new message instance.
     *
     * @param  mixed  $order
     * @param  string  $newStatus
     * @param  string  $oldStatus
     * @return void
     */
    public function __construct($order, $newStatus, $oldStatus)
    {
        $this->order = $order;
        $this->newStatus = $newStatus;
        $this->oldStatus = $oldStatus;

        // Check if user has fullCustomerName method
        if (method_exists($order->user, 'fullCustomerName')) {
            $this->customerName = $order->user->fullCustomerName();
        } else {
            // Fallback to using first_name and last_name properties if available
            $firstName = $order->user->first_name ?? 'Customer';
            $lastName = $order->user->last_name ?? '';
            $this->customerName = trim("$firstName $lastName");
        }

        Log::info('OrderStatusUpdatedMail constructed', [
            'orderId' => $order->orderID,
            'customerName' => $this->customerName,
            'newStatus' => $newStatus
        ]);
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $orderName = $this->order->orderName ?? 'Your order';

        return $this->subject('Your Order Status Has Been Updated')
            ->view('emails.emailorderstatus')
            ->with([
                'orderName' => ucfirst($orderName),
                'newStatus' => $this->newStatus,
                'oldStatus' => $this->oldStatus,
                'orderId' => $this->order->orderID,
                'customerName' => $this->customerName,
            ]);
    }
}
