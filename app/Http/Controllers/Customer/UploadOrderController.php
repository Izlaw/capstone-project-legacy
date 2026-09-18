<?php

namespace App\Http\Controllers\Customer;

use App\Models\Fabric;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Controllers\Customer\BillingStatementController;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Models\Message;
use App\Models\Conversation;
use App\Models\UploadOrder;
use App\Models\Order;
use App\Models\Size;
use Illuminate\Support\Facades\Log;
use App\Events\ConversationCreated;
use Barryvdh\DomPDF\Facade\Pdf;

class UploadOrderController extends Controller
{
    public function uploadDesignAndSendMessage(Request $request)
    {
        try {
            Log::info('uploadDesignAndSendMessage called');

            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                'message' => 'required|string',
                'sizes' => 'required|array',
                'quantities' => 'required|array',
                'fabric_id' => 'required|integer',
                'custom_fabric_name' => 'nullable|string',
            ]);

            $request->validate([
                'custom_fabric_name' => 'required_if:fabric_id,1',
            ]);

            $request->merge([
                'custom_fabric_name' => (string) $request->input('custom_fabric_name'),
            ]);

            $imageUrl = null;
            $imagePath = null;
            if ($request->file('image')) {
                $imagePath = $request->file('image')->store('designs', 'public');
                $imageUrl = Storage::url($imagePath);
                Log::info('Image uploaded: ' . $imageUrl);
            }

            $randomEmployee = User::where('role', 'employee')->inRandomOrder()->first();

            if (!$randomEmployee) {
                Log::error('No employee available to assign to the conversation.');
                return response()->json(['success' => false, 'message' => 'No employee available to process your request.'], 500);
            }

            // Create a new conversation
            $conversation = new Conversation();
            $conversation->user_id = Auth::id();
            $conversation->assigned_employee = $randomEmployee->user_id;
            $conversation->save();
            Log::info('Conversation created: ' . $conversation->convoID);

            // Create a new message
            $messageContent = $request->input('message');
            if ($imageUrl) {
                $messageContent .= '<br><img src="' . $imageUrl . '" alt="Design Image" style="max-width: 100%; height: auto;">';
            }

            $message = new Message([
                'messContent' => $messageContent,
                'messDate' => now(),
                'user_id' => Auth::id(),
                'convoID' => $conversation->convoID,
            ]);

            $message->save();
            Log::info('Message created: ' . $message->messID);

            // Update the conversation with the latest message ID
            $conversation->messID = $message->messID;
            $conversation->save();
            Log::info('Conversation updated with message ID: ' . $message->messID);

            // Create a new upload order
            // Get fabric ID and custom name from request
            $fabricID = $request->input('fabric_id');
            $customFabricName = $request->input('custom_fabric_name');
            $fabricName = null; // Initialize fabric name

            // If fabric_id is 1 (Custom) and a custom name is provided, create a new fabric
            if ($fabricID == 1 && !empty($customFabricName)) {
                Log::info('Creating custom fabric: ' . $customFabricName);
                $fabric = new Fabric();
                $fabric->fabricName = $customFabricName;
                // Determine the price for the custom fabric.
                $baseCustomFabric = Fabric::find(1); // Find the placeholder 'Custom' fabric entry
                $fabric->fabricPrice = $baseCustomFabric ? $baseCustomFabric->fabricPrice : 0; // Use its price or default to 0
                $fabric->is_custom = true; // Mark it as custom
                $fabric->save(); // Save the new fabric to get its auto-incremented ID
                $newFabricID = $fabric->fabricID; // Get the ID of the newly created fabric row
                $fabricName = $customFabricName; // Set fabricName to the custom name
                Log::info('Custom fabric created with ID: ' . $newFabricID . ' and Name: ' . $fabricName);
                // IMPORTANT: Use the *new* fabric's ID for the order, not 1
                $fabricID = $newFabricID;
            } else if ($fabricID != 1) {
                // If not custom (ID is not 1), find the existing fabric
                $fabric = Fabric::find($fabricID);
                if ($fabric) {
                    $fabricName = $fabric->fabricName;
                } else {
                    Log::error('Fabric not found for ID: ' . $fabricID);
                    // Handle error: fabric not found
                    return response()->json(['success' => false, 'message' => 'Selected fabric not found.'], 400);
                }
            } else {
                // Handle case where fabric_id is 1 but no custom name provided (should be caught by validation)
                Log::error('Custom fabric selected (ID 1) but no custom name provided.');
                return response()->json(['success' => false, 'message' => 'Please provide a name for the custom fabric.'], 400);
            }

            $uploadOrder = new UploadOrder([
                'upName' => $request->file('image')->getClientOriginalName(),
                'upQuantity' => array_sum($request->input('quantities')),
                'upAmount' => 0, // We'll calculate and update this below
                'fabricID' => $fabricID,
                'fabricName' => $fabricName, // This will be either the custom name or the standard fabric name
                'user_id' => Auth::id(),
            ]);
            $uploadOrder->save();
            Log::info('Upload order created: ' . $uploadOrder->upID);

            // Make sure the upload order has an ID before attaching sizes
            if (!$uploadOrder->upID) {
                Log::error('Upload order ID is null after save');
                return response()->json(['success' => false, 'message' => 'Error creating upload order'], 500);
            }

            // Attach sizes and quantities to the upload order
            $sizes = $request->input('sizes');
            $quantities = $request->input('quantities');

            foreach ($sizes as $index => $sizeName) {
                $size = Size::where('sizeName', $sizeName)->first();
                if ($size) {
                    $uploadOrder->sizes()->attach($size->sizeID, ['quantity' => $quantities[$index]]);
                    Log::info('Attached size: ' . $size->sizeID . ' with quantity: ' . $quantities[$index]);
                } else {
                    Log::warning('Size not found: ' . $sizeName);
                }
            }

            // Calculate the total amount using the new formula: totalAmount = (sizeQuantity * sizePrice) + (sizeQuantity * fabricPrice)
            $totalAmount = 0;

            // Get the fabric object once to use its price in calculations
            $fabric = Fabric::find($fabricID);
            $fabricPrice = $fabric ? $fabric->fabricPrice : 0;

            foreach ($sizes as $index => $sizeName) {
                $size = Size::where('sizeName', $sizeName)->first();
                if ($size) {
                    $sizePrice = $size->sizePrice;
                    $quantity = $quantities[$index];

                    // Apply the new formula: (sizeQuantity * sizePrice) + (sizeQuantity * fabricPrice)
                    $totalAmount += ($sizePrice * $quantity) + ($fabricPrice * $quantity);
                }
            }

            // Update the upload order with the total amount
            $uploadOrder->upAmount = $totalAmount;
            $uploadOrder->save();
            Log::info('Upload order updated with total amount: ' . $totalAmount);

            // Create a new order
            $order = new Order([
                'orderTotal' => $totalAmount,
                'orderStatus' => 'Pending',
                'orderQuantity' => array_sum($quantities),
                'dateOrder' => now(),
                'user_id' => Auth::id(),
                'upID' => $uploadOrder->upID,
                'convoID' => $conversation->convoID,
            ]);
            $order->save();
            Log::info('Order created: ' . $order->orderID);

            // Generate the billing statement using the BillingStatementController
            app(BillingStatementController::class)->generate($order);

            // Dispatch the event to broadcast the conversation
            broadcast(new ConversationCreated($conversation));
            Log::info('ConversationCreated event broadcasted');

            return response()->json(['success' => true, 'redirectUrl' => route('chat', ['convoID' => $conversation->convoID])]);
        } catch (\Exception $e) {
            Log::error('Error in uploadDesignAndSendMessage: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json(['success' => false, 'message' => 'An error occurred while processing your request.'], 500);
        }
    }
}
