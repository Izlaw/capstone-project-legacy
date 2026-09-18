<?php

namespace App\Http\Controllers\Customer;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth; // For user authentication
use App\Models\User; // Import your User model
use App\Models\Message; // Import your Message model
use App\Models\Conversation;

class FAQController extends Controller
{

    public function askSupport()
    {
        Log::info('askSupport method started for user', [
            'user_id' => Auth::id(),
        ]);

        // Check if an existing support chat conversation exists for the user
        // Ordering by convoID descending as there are no timestamps
        $existingConversation = Conversation::where('user_id', Auth::id())
            ->whereNotNull('assigned_employee') // Assuming an assigned employee means it's a support chat
            ->whereDoesntHave('order') // Ensure it's not linked to a specific order
            ->orderByDesc('convoID') // Order by primary key descending to get the latest
            ->first();

        if ($existingConversation) {
            Log::info('Existing support chat found for user, redirecting.', [
                'user_id' => Auth::id(),
                'convoID' => $existingConversation->convoID,
            ]);
            // Redirect to the existing customer chat interface
            return redirect()->route('asksupport', ['convoID' => $existingConversation->convoID]);
        }

        // If no existing conversation, proceed to create a new one
        // Fetch a random employee user
        $randomEmployee = User::where('role', 'employee')->inRandomOrder()->first();

        if ($randomEmployee) {
            Log::info('Customer redirected to a random employee', [
                'customer_id' => Auth::id(),
                'random_employee_id' => $randomEmployee->user_id,
            ]);

            // Create a new conversation
            $conversation = Conversation::create([
                'user_id' => Auth::id(),
                'messID' => null,
                'assigned_employee' => $randomEmployee->user_id,
            ]);

            // Create the initial message and associate it with the conversation
            $message = Message::create([
                'user_id' => Auth::id(),  // Customer who sent the message
                'messContent' => 'Hi! I need assistance.', // Message content
                'convoID' => $conversation->convoID, // Use the convoID from the conversation
                'messDate' => now(), // Set current timestamp for the message
            ]);

            Log::info('Initial message created', [
                'message_id' => $message->messID,
                'message_content' => $message->messContent,
                'convoID' => $conversation->convoID, // Log the convoID with the message
            ]);

            // Store the convoID in the session
            session(['support_chat_convoID' => $conversation->convoID]);

            // Redirect to the customer chat interface, passing the conversation ID
            return redirect()->route('asksupport', ['convoID' => $conversation->convoID]);
        } else {
            Log::error('No employees found for support chat', [
                'customer_id' => Auth::id(),
            ]);
            abort(404, 'No employees found');
        }
    }
}
