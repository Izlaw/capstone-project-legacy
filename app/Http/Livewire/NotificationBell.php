<?php

namespace App\Http\Livewire;

use Livewire\Component;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderStatusUpdatedMail;
use Carbon\Carbon;
use App\Models\Conversation;

class NotificationBell extends Component
{
    public $notifications = [];
    public $unreadCount = 0;
    public $userRole;

    protected $listeners = [
        'conversationCreated' => 'handleConversationCreated',
        'loadNotifications'   => 'loadNotificationsFromStorage',
        'orderStatusUpdated'  => 'handleOrderStatusUpdated', // existing listener
        'refreshStatus'       => 'handleRefreshStatus',      // new listener for broadcast events
    ];

    public function mount()
    {
        // Log::info('NotificationBell::mount called');
        if (Auth::check()) {
            $this->userRole = Auth::user()->role;
            $this->loadOrders();
        } else {
            $this->userRole = 'guest';
        }
    }

    private function getLatestOrders()
    {
        $query = Order::with('user')->orderBy('orderID', 'desc');

        // If the user is a customer, only fetch their orders
        if (Auth::check() && Auth::user()->role === 'customer') {
            $query->where('user_id', Auth::id());
        }

        return $query->take(5)->get();
    }

    private function formatAdminNotifications($orders)
    {
        $notifications = [];
        foreach ($orders as $order) {
            $userName = $order->user->fullCustomerName();
            $orderID  = $order->orderID;
            $notifications[] = [
                'content' => 'New order from: ' . $userName,
                'type'    => 'admin',
                'orderID' => $orderID,
                'status'  => $order->orderStatus
            ];
        }
        return $notifications;
    }

    private function formatCustomerNotifications($orders)
    {
        $notifications = [];
        foreach ($orders as $order) {
            $orderDetails = [
                'type' => 'custom', // Default type
                'name' => 'T-Shirt' // Default name
            ];

            // Determine order type and get correct name
            if ($order->collectID && $order->collection) {
                $orderDetails['type'] = 'collection';
                $orderDetails['name'] = $order->collection->collectName;
            } elseif ($order->upID && $order->uploadOrder) {
                $orderDetails['type'] = 'upload';
                $orderDetails['name'] = $order->uploadOrder->upName;
            } elseif ($order->customID && $order->customOrder) {
                $orderDetails['type'] = 'custom';
                $orderDetails['name'] = 'T-Shirt'; // Custom orders are always T-Shirts
            }

            $notifications[] = [
                'status' => $order->orderStatus,
                'orderID' => $order->orderID,
                'type' => 'customer',
                'orderDetails' => $orderDetails
            ];
        }
        return $notifications;
    }

    public function loadOrders()
    {
        $orders = $this->getLatestOrders();
        if ($this->userRole === 'admin' || $this->userRole === 'employee') {
            $this->notifications = $this->formatAdminNotifications($orders);
        } elseif ($this->userRole === 'customer') {
            // Retrieve the last time notifications were marked as read from session
            $lastRead = session()->get('notifications_last_read');
            $this->notifications = $this->formatCustomerNotifications($orders);
        }
        $this->updateUnreadCount();
    }

    private function updateUnreadCount()
    {
        if ($this->userRole === 'admin' || $this->userRole === 'employee') {
            // Count only admin notifications
            $this->unreadCount = count(array_filter($this->notifications, function ($notification) {
                return $notification['type'] === 'admin';
            }));
        } elseif ($this->userRole === 'customer') {
            // Count only customer notifications
            $this->unreadCount = count(array_filter($this->notifications, function ($notification) {
                return $notification['type'] === 'customer';
            }));
        } else {
            $this->unreadCount = 0;
        }

        $this->emit('notificationUpdated', $this->unreadCount);
    }

    public function handleOrderStatusUpdated($orderId, $newStatus, $oldStatus = null)
    {
        Log::info('handleOrderStatusUpdated called in NotificationBell', [
            'orderId' => $orderId,
            'newStatus' => $newStatus,
            'oldStatus' => $oldStatus
        ]);

        $order = Order::with(['user', 'collection', 'uploadOrder', 'customOrder'])->find($orderId);
        if (!$order) {
            Log::error('Order not found', ['orderId' => $orderId]);
            return;
        }

        // For customer notifications in the UI, only show them to the specific customer associated with the order
        if ($this->userRole === 'customer' && Auth::id() == $order->user_id) {
            $orderDetails = [
                'type' => 'custom', // Default type
                'name' => 'T-Shirt' // Default name
            ];

            // Determine order type and get correct name
            if ($order->collectID && $order->collection) {
                $orderDetails['type'] = 'collection';
                $orderDetails['name'] = $order->collection->collectName;
            } elseif ($order->upID && $order->uploadOrder) {
                $orderDetails['type'] = 'upload';
                $orderDetails['name'] = $order->uploadOrder->upName;
            } elseif ($order->customID && $order->customOrder) {
                $orderDetails['type'] = 'custom';
                $orderDetails['name'] = 'T-Shirt'; // Custom orders are always T-Shirts
            }

            $newNotification = [
                'status' => $newStatus,
                'orderID' => $orderId,
                'type' => 'customer',
                'orderDetails' => $orderDetails
            ];

            // Check if a notification for this order already exists
            $existingNotificationIndex = $this->findNotificationIndexByOrderId($orderId);

            if ($existingNotificationIndex !== false) {
                // Update the existing notification
                $this->notifications[$existingNotificationIndex] = $newNotification;
            } else {
                // Add a new notification
                array_unshift($this->notifications, $newNotification);
            }

            $this->updateUnreadCount();
        }

        Log::info('Attempting to send email', [
            'email' => $order->user->email,
            'userRole' => $this->userRole,
            'orderId' => $orderId
        ]);

        // Always attempt to send email regardless of who triggered the status update
        try {
            // Make sure user relation is loaded
            if (!$order->user) {
                Log::error('User relation not found for order', ['orderId' => $orderId]);
                return;
            }

            if (!$order->user->email) {
                Log::error('User email is missing', ['userId' => $order->user->id]);
                return;
            }

            $conversation = Conversation::find($order->convoID);
            if ($order->user && $order->user->email) {
                Mail::to($order->user->email)->send(new OrderStatusUpdatedMail($order, $newStatus, $oldStatus));
            } else {
                Log::error('Customer email not found for order', ['orderId' => $order->orderID]);
                Log::error('Assigned employee not found for conversation', ['convoID' => $order->convoID]);
            }
            Log::info('Email sent successfully');
        } catch (\Exception $e) {
            Log::error('Failed to send email: ' . $e->getMessage(), [
                'orderId' => $orderId,
                'email' => $order->user->email ?? 'unknown'
            ]);
            Log::error($e->getTraceAsString());
        }
    }

    // Helper method to find notification by order ID
    private function findNotificationIndexByOrderId($orderId)
    {
        foreach ($this->notifications as $index => $notification) {
            if (isset($notification['orderID']) && $notification['orderID'] == $orderId) {
                return $index;
            }
        }
        return false;
    }

    // New method: update notifications when a broadcast event is received via Livewire
    public function handleRefreshStatus($orderId, $status)
    {

        // Only process customer notifications if user is a customer
        if ($this->userRole !== 'customer') {
            return;
        }

        $order = Order::find($orderId);
        // Also check if the order belongs to the currently authenticated customer
        if ($order && Auth::id() == $order->user_id) {
            $newNotification = [
                'status'  => $status,
                'orderID' => $orderId,
                'type'    => 'customer',
                // Note: orderDetails might be missing here if not broadcasted,
                // but the core filtering logic is applied.
                // Consider adding orderDetails to the broadcast event if needed.
            ];

            // Check if a notification for this order already exists
            $existingNotificationIndex = $this->findNotificationIndexByOrderId($orderId);

            if ($existingNotificationIndex !== false) {
                // Update the existing notification
                $this->notifications[$existingNotificationIndex] = $newNotification;
            } else {
                // Add a new notification
                array_unshift($this->notifications, $newNotification);
            }

            $this->updateUnreadCount();
        }
    }

    public function handleConversationCreated($event)
    {
        // Only process admin notifications if user is admin/employee
        if ($this->userRole !== 'admin' && $this->userRole !== 'employee') {
            return;
        }

        $newNotification = [
            'content' => 'A new conversation has been created. Order ID: ' . $event->orderID,
            'orderID' => $event->orderID,
            'type'    => 'admin',
            'status'  => 'Pending' // Default status for new conversations
        ];

        // For conversations, check if admin notification for this order already exists
        $existingNotificationIndex = $this->findNotificationIndexByOrderId($event->orderID);

        if ($existingNotificationIndex !== false) {
            // Update the existing notification
            $this->notifications[$existingNotificationIndex] = $newNotification;
        } else {
            // Add a new notification
            array_unshift($this->notifications, $newNotification);
        }

        $this->updateUnreadCount();
    }

    public function markAsRead()
    {
        session()->flash('message', 'Marked as read!');
        // Record the current time as the last time notifications were read.
        session()->put('notifications_last_read', now());
        $this->notifications = [];
        $this->unreadCount = 0;
        $this->emit('clearNotifications');
    }

    public function loadNotificationsFromStorage()
    {
        $this->emit('loadFromStorage');
    }

    public function render()
    {
        return view('livewire.notification-bell', [
            'userRole' => $this->userRole,
        ]);
    }
}
