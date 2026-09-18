<?php

namespace App\Http\Controllers\Customer;

use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\CustomOrder;
use App\Models\Size;
use App\Models\User;
use App\Models\Conversation;
use App\Models\Order;
use App\Events\MessageSent;
use App\Models\Message;
use App\Events\ConversationCreated;
use App\Events\OrderCreated;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Http\Controllers\BillingStatementController;
use App\Models\Fabric;
use App\Models\Timeframe;

class CustomOrderController extends Controller
{
    public function customize(Request $request)
    {
        // Get the selected model type
        $model = $request->query('model');

        $sizes = Size::all();
        // Pass the selected model type to the view
        return view('customerui.customize', compact('model', 'sizes'));
    }

    public function previewOrder($id)
    {
        // Use 'customModel' instead of 'model'
        $customOrder = CustomOrder::with(['orders', 'timeframe'])->findOrFail($id);

        // Ensure there is a related Order before trying to access its ID
        $orderId = null;
        if ($customOrder->orders->isNotEmpty()) {
            $orderId = $customOrder->orders->first()->orderID;
        } else {
            // Log an error or handle the case where no related Order is found
            Log::error('No related Order found for CustomOrder ID: ' . $id);
            // You might want to redirect or show an error page here
            // For now, we'll proceed with orderId as null, which might cause the Livewire component to show 'Unknown'
        }

        // Return the view and pass the custom order data and the related order ID
        return view('previeworder', [
            'customOrder' => $customOrder,
            'orderId' => $orderId,
        ]);
    }

    public function generateQRCode(Request $request)
    {
        Log::info('Incoming request data:', $request->all());

        try {
            // First validate the base requirements that don't change
            $baseValidation = [
                'colors' => 'required|array',
                'colors.backColor' => 'required|string',
                'colors.frontColor' => 'required|string',
                'colors.sleevesColor' => 'required|string',
                'colors.collarColor' => 'required|string',
                'sizes' => 'required|array|min:1',
                'sizes.*.sizeID' => 'required|exists:sizes,sizeID',
                'sizes.*.quantity' => 'required|integer|min:1',
                'fabric_id' => 'required|integer', // Changed from fabric_type to fabric_id
                'custom_fabric_name' => 'nullable|string', // Added for custom fabric names
                'collectID' => 'sometimes|exists:collections,collectID',
                'upID' => 'sometimes|exists:upload_orders,upID',
                'text' => 'nullable|json', // Add validation for the text field (expecting a JSON string)
            ];

            // Add validation for custom fabric name when fabric_id is 1
            $request->validate([
                'custom_fabric_name' => 'required_if:fabric_id,1', // Require custom_fabric_name when fabric_id is 1
            ]);

            // Validate the request with our validation rules
            $validatedData = $request->validate($baseValidation);

            // Determine the fabric type and ID to use
            $fabricID = $validatedData['fabric_id'];
            $fabricName = null;
            $fabricType = null;

            // Handle custom fabric creation if needed
            if ($fabricID == 1 && !empty($request->input('custom_fabric_name'))) {
                Log::info('Creating custom fabric: ' . $request->input('custom_fabric_name'));
                $customFabricName = $request->input('custom_fabric_name');

                $fabric = new Fabric();
                $fabric->fabricName = $customFabricName;
                // Get the base Custom fabric's price or default to a standard price
                $baseCustomFabric = Fabric::find(1);
                $fabric->fabricPrice = $baseCustomFabric ? $baseCustomFabric->fabricPrice : 250;
                $fabric->is_custom = true;
                $fabric->save();

                $fabricID = $fabric->fabricID;
                $fabricName = $customFabricName;
                $fabricType = $customFabricName;

                Log::info('Custom fabric created with ID: ' . $fabricID . ' and Name: ' . $fabricName);
            } else {
                // Get existing fabric details
                $fabric = Fabric::find($fabricID);
                if ($fabric) {
                    $fabricName = $fabric->fabricName;
                    $fabricType = $fabric->fabricName;
                } else {
                    Log::error('Fabric not found for ID: ' . $fabricID);
                    return response()->json(['error' => 'Selected fabric not found'], 400);
                }
            }

            // Calculate total amount and custom quantity
            $totalSizeCost = 0;
            $totalUnits = 0;

            // Retrieve timeframe and percentage cost outside the loop
            $timeframeID = $request->input('timeframe_id');
            $percentageCost = 0;

            if ($timeframeID) {
                $timeframe = Timeframe::find($timeframeID);
                if ($timeframe) {
                    $percentageCost = $timeframe->percentageCost;
                    Log::info('Timeframe percentage cost retrieved from database', ['timeframeID' => $timeframeID, 'percentageCost' => $percentageCost]);
                } else {
                    Log::warning('Timeframe not found in database, using default percentage cost', ['timeframeID' => $timeframeID]);
                    $percentageCost = 0;
                }
            }

            $totalSizeBaseCost = 0; // Calculate the sum of sizePrice * quantity
            $totalUnits = 0; // Calculate the total quantity

            foreach ($validatedData['sizes'] as $sizeData) {
                $size = Size::findOrFail($sizeData['sizeID']);
                $sizePrice = $size->sizePrice;
                $quantity = $sizeData['quantity'];

                // Accumulate base size cost and unit count
                $totalSizeBaseCost += $sizePrice * $quantity;
                $totalUnits += $quantity;
            }

            // fetch your fabric price once
            $fabric = Fabric::find($fabricID);
            $fabricPrice = $fabric ? $fabric->fabricPrice : 250;

            // Calculate total fabric cost
            $fabricCost = $fabricPrice * $totalUnits;

            // FINAL TOTAL based on the new formula: (sizePrice * sizeQuantity) + (fabricPrice * sizeQuantity) + percentageCost
            // Assuming sizeQuantity refers to the total quantity across all sizes ($totalUnits)
            $totalAmount = ($totalSizeBaseCost + $fabricCost) * (1 + $percentageCost / 100);

            Log::info('Calculated total amount:', ['totalAmount' => $totalAmount]);
            Log::info('Calculated total units:', ['totalUnits' => $totalUnits]);

            // Create the custom order
            $customOrder = CustomOrder::create([
                'colors' => $validatedData['colors'],
                'fabricID' => $fabricID,
                'timeframeID' => $timeframeID,
                'user_id' => $request->user()->user_id,
                'totalAmount' => $totalAmount,
                'customQuantity' => $totalUnits,
                // Decode the JSON string from the request into a PHP array for the model cast
                'text' => json_decode($validatedData['text'], true) ?? null,
            ]);
            Log::info('Created custom order:', ['data' => json_encode($customOrder->toArray(), JSON_PRETTY_PRINT)]);

            // Save the sizes and quantities in the pivot table
            foreach ($validatedData['sizes'] as $sizeData) {
                $customOrder->sizes()->attach($sizeData['sizeID'], ['quantity' => $sizeData['quantity']]);
            }

            $randomEmployee = User::where('role', 'employee')->inRandomOrder()->first();

            if (!$randomEmployee) {
                Log::error('No employee available to assign to the conversation.');
                // Handle the case where no employee is available, e.g., by throwing an exception or returning an error response
                throw new \Exception('No employee available to assign to the conversation.');
            }

            // Check for existing conversation linked to a previous custom order for this user
            $existingConversation = Conversation::where('user_id', $request->user()->user_id)
                ->whereHas('orders', function ($query) {
                    $query->whereNotNull('customID');
                })
                ->orderBy('convoID', 'desc') // Get the latest one
                ->first();

            if ($existingConversation) {
                $conversation = $existingConversation;
                // Optionally update assigned employee if needed, e.g., if the old one is inactive
                // $conversation->assigned_employee = $randomEmployee->user_id;
                // $conversation->save();
                Log::info('Reusing existing custom order conversation for new order:', ['convoID' => $conversation->convoID]);
            } else {
                // Create a new conversation if no suitable existing one is found
                $conversation = Conversation::create([
                    'user_id' => $request->user()->user_id,
                    'messID' => null, // Will be updated later if needed
                    'assigned_employee' => $randomEmployee->user_id,
                ]);
                Log::info('Created new conversation for custom order:', ['convoID' => $conversation->convoID]);
            }

            // Create the order entry
            $order = Order::create([
                'orderTotal' => $totalAmount,
                'orderStatus' => 'Pending',
                'orderQuantity' => $totalUnits,
                'dateOrder' => now(),
                'user_id' => $customOrder->user_id,
                'customID' => $customOrder->customID,
                'collectID' => $validatedData['collectID'] ?? null,
                'upID' => $validatedData['upID'] ?? null,
                'convoID' => $conversation->convoID,
            ]);

            // Generate the preview URL for the custom order
            $previewUrl = route('previeworder', ['id' => $customOrder->customID]);
            Log::info('Generated preview URL:', ['url' => $previewUrl]);

            // Generate the QR code image
            $qrCodeImage = QrCode::format('png')->size(300)->errorCorrection('H')->generate($previewUrl);
            $filePath = 'orders/qrcodes/QRcode-order-' . $customOrder->customID . '.png';
            Storage::disk('public')->put($filePath, $qrCodeImage);
            Log::info('QR Code saved:', ['path' => $filePath]);

            $order = Order::where('customID', $customOrder->customID)->first();
            $billingFileName = 'Billing-Statement-' . $order->orderID . '.pdf';
            $billingFilePath = 'orders/billingstatements/' . $billingFileName;

            // Return the view with necessary data
            return view('qrcode', [
                'qrCode' => asset('storage/' . $filePath),
                'order' => $customOrder,
                'conversation' => $conversation,
                'billingFilePath' => $billingFilePath,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in QR Code Generation:', [
                'message' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    public function sendQRCodeToEmployee(Request $request)
    {
        $userID = Auth::id();
        $order = Order::where('user_id', $userID)->orderBy('orderID', 'desc')->first();

        if (!$order) {
            Log::error('Order not found for the user.', ['user_id' => $userID]);
            return response()->json(['error' => 'Order not found'], 404);
        }

        $filePath = 'orders/qrcodes/QRcode-order-' . $order->customID . '.png';

        if (!file_exists(storage_path('app/public/' . $filePath))) {
            Log::error('QR code file not found.', ['file_path' => $filePath]);
            return response()->json(['error' => 'QR code not found'], 404);
        }

        $randomEmployee = User::where('role', 'employee')->inRandomOrder()->first();

        if (!$randomEmployee) {
            Log::error('No employee available to send the QR code.');
            return response()->json(['error' => 'No employee available'], 400);
        }

        Log::info('Customer redirected to a random employee', [
            'customer_id' => $userID,
            'random_employee_id' => $randomEmployee->user_id,
        ]);

        // Get the conversation associated with the order
        // This conversation was either found or created in generateQRCode
        $conversation = $order->conversation;

        if (!$conversation) {
            Log::error('Conversation not found for order.', ['orderID' => $order->orderID, 'user_id' => $userID]);
            // Handle error appropriately - maybe redirect back with an error message
            // For now, let's try creating one just in case, though this shouldn't happen
            // if generateQRCode worked correctly.
            $conversation = Conversation::create([
                'user_id' => $userID,
                'messID' => null,
                'assigned_employee' => $randomEmployee->user_id,
            ]);
            Log::warning('Created fallback conversation in sendQRCodeToEmployee', ['convoID' => $conversation->convoID]);
            // Associate the new conversation with the order if possible (might need adjustment)
            $order->convoID = $conversation->convoID;
            $order->save();
        }

        // Determine the employee to notify (the one assigned to the conversation)
        $employeeToNotify = $conversation->assignedEmployee ?? $randomEmployee;

        $messageContent = "Hello! This is my order.";
        $message = Message::create([
            'messContent' => $messageContent,
            'messDate' => now(),
            'user_id' => $userID,
            'convoID' => $conversation->convoID,
            'type' => 'text',
        ]);

        $imageUrl = asset('storage/' . $filePath);
        $imageMessage = Message::create([
            'messContent' => $imageUrl,
            'messDate' => now(),
            'user_id' => $userID,
            'convoID' => $conversation->convoID,
            'type' => 'image',
        ]);

        $conversation->update(['messID' => $imageMessage->messID]);

        // Ensure we have an employee to notify
        if (!$employeeToNotify) {
            Log::error('No employee assigned to conversation or found randomly.', ['convoID' => $conversation->convoID]);
            // Handle error - maybe assign a default admin or return an error
            return response()->json(['error' => 'Could not determine employee to notify'], 500);
        }

        broadcast(new MessageSent($employeeToNotify, $imageMessage));

        Log::info('Message sent to employee', [
            'customer_id' => $userID,
            'employee_id' => $employeeToNotify->user_id, // Log the correct employee
            'conversation_id' => $conversation->convoID,
        ]);

        return redirect()->route('chat', ['convoID' => $conversation->convoID]);
    }

    public function downloadQRCode($customID)
    {
        Log::info('Download QR Code requested for order ID:', ['id' => $customID]);

        $order = CustomOrder::findOrFail($customID);
        Log::info('Retrieved order data:', ['order' => $order->toArray()]);

        $previewUrl = route('previeworder', ['id' => $order->customID]);
        Log::info('Generated Preview URL for QR Code:', ['previewUrl' => $previewUrl]);

        try {
            $qrCodeImage = QrCode::format('png')->size(300)->errorCorrection('H')->generate($previewUrl);
            Log::info('QR Code generated successfully.');
            return response()->stream(function () use ($qrCodeImage) {
                echo $qrCodeImage;
            }, 200, [
                'Content-Type' => 'image/png',
                'Content-Disposition' => 'attachment; filename="QRCode.png"',
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating QR Code:', [
                'message' => $e->getMessage(),
                'order_id' => $customID,
            ]);
            return response()->json(['error' => 'QR Code generation failed'], 500);
        }
    }

    public function generateBillingStatement(Request $request)
    {
        try {
            Log::info('Starting billing statement generation.');

            if (!$request->user()) {
                Log::error('User is not authenticated.');
                return response()->json(['error' => 'User not authenticated.'], 401);
            }

            Log::info('Authenticated User ID:', ['user_id' => $request->user()->user_id]);

            $validatedData = $request->validate([
                'colors' => 'required|array',
                'colors.backColor' => 'required|string',
                'colors.frontColor' => 'required|string',
                'colors.sleevesColor' => 'required|string',
                'colors.collarColor' => 'required|string',
                'sizes' => 'required|array|min:1',
                'sizes.*.sizeID' => 'required|exists:sizes,sizeID',
                'sizes.*.quantity' => 'required|integer|min:1',
                'fabric_id' => 'required|integer',
                'timeframe_id' => 'required|integer',
                'custom_fabric_name' => 'nullable|string',
            ]);

            Log::info('Request data validated successfully', $validatedData);

            // Find the custom order based on the most recent one for this user
            // Since we're changing the fabric handling, we need to find by user_id and possibly other identifiers
            $customOrder = CustomOrder::with(['sizes', 'timeframe'])
                ->where('user_id', $request->user()->user_id)
                ->orderBy('customID', 'desc')
                ->first();

            if (!$customOrder) {
                Log::error('Custom order not found for user', ['user_id' => $request->user()->user_id]);
                return response()->json(['error' => 'Custom order not found.'], 404);
            }

            Log::info('Custom order retrieved successfully', ['customOrder' => $customOrder->toArray()]);

            $customQuantity = 0;
            $totalQuantity = $customOrder->totalAmount;
            foreach ($validatedData['sizes'] as $sizeData) {
                $customQuantity += $sizeData['quantity'];
            }

            // Calculate total amount based on sizes (This loop is correct for the first part of the new formula)
            $totalSizeBaseCost = 0; // Renamed for clarity
            foreach ($validatedData['sizes'] as $sizeData) {
                $size = Size::findOrFail($sizeData['sizeID']);
                $sizePrice = $size->sizePrice;
                $quantity = $sizeData['quantity'];
                $totalSizeBaseCost += ($sizePrice * $quantity);
            }

            // Get the fabric based on fabric_id
            $fabricID = $validatedData['fabric_id'];
            $fabricPrice = 0;

            // Handle custom fabric case
            if ($fabricID == 1 && !empty($validatedData['custom_fabric_name'])) {
                // If it's a custom fabric that already exists, find it
                $fabric = Fabric::where('fabricName', $validatedData['custom_fabric_name'])
                    ->where('is_custom', true)
                    ->first();

                // If the custom fabric doesn't exist yet, create it
                if (!$fabric) {
                    $fabric = new Fabric();
                    $fabric->fabricName = $validatedData['custom_fabric_name'];
                    $baseCustomFabric = Fabric::find(1);
                    $fabric->fabricPrice = $baseCustomFabric ? $baseCustomFabric->fabricPrice : 250;
                    $fabric->is_custom = true;
                    $fabric->save();

                    Log::info('Created new custom fabric for billing', [
                        'fabric_id' => $fabric->fabricID,
                        'fabric_name' => $fabric->fabricName
                    ]);
                }

                $fabricID = $fabric->fabricID;
                $fabricPrice = $fabric->fabricPrice;
            } else {
                // Regular fabric case
                $fabric = Fabric::find($fabricID);
                if ($fabric) {
                    $fabricPrice = $fabric->fabricPrice;
                } else {
                    Log::warning('Fabric not found in database, using default price', ['fabricID' => $fabricID]);
                    $fabricPrice = 250;
                }
            }

            $timeframeID = $validatedData['timeframe_id'];
            $percentageCost = 0;

            if ($timeframeID) {
                $timeframe = Timeframe::find($timeframeID);
                if ($timeframe) {
                    $percentageCost = $timeframe->percentageCost;
                    Log::info('Timeframe percentage cost retrieved from database', ['timeframeID' => $timeframeID, 'percentageCost' => $percentageCost]);
                } else {
                    Log::warning('Timeframe not found in database, using default percentage cost', ['timeframeID' => $timeframeID]);
                    $percentageCost = 0;
                }
            }

            // Ensure $percentageCost is an integer
            $percentageCost = intval($percentageCost);

            // Calculate total fabric cost (using the total quantity)
            $totalUnits = $customQuantity; // $customQuantity is the total quantity calculated earlier
            $fabricCost = $fabricPrice * $totalUnits;

            // FINAL TOTAL based on the new formula: (sizePrice * sizeQuantity) + (fabricPrice * sizeQuantity) + percentageCost
            // Assuming sizeQuantity refers to the total quantity across all sizes ($totalUnits)
            $totalAmount = ($totalSizeBaseCost + $fabricCost) * (1 + $percentageCost / 100);

            Log::info('Total amount calculated', ['totalAmount' => $totalAmount]);

            $customer = $request->user();
            $firstName = $customer->first_name;
            $lastName = $customer->last_name;
            $customerAddress = $customer->address;
            Log::info('Customer data retrieved', [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $customer->email,
                'address' => $customerAddress,
            ]);

            $orders = $customOrder->orders;
            if ($orders->isEmpty()) {
                Log::error('No related orders found for Custom Order', ['customID' => $customOrder->customID]);
                return response()->json(['error' => 'No related orders found for Custom Order'], 404);
            }
            $order = $orders->first();
            $orderID = $order->orderID;

            if ($order->collectID) {
                $sizes = $order->collections()->withPivot('sizeID', 'quantity')->get();
                foreach ($sizes as $size) {
                    $size->pivot->sizePrice = Size::find($size->pivot->sizeID)->sizePrice;
                }
            } else {
                $sizes = $customOrder->sizes;
            }

            $totalQuantity = $customOrder->totalAmount;

            $uploadOrder = $customOrder->uploadOrder ?? null;

            $pdf = Pdf::loadView('billingstatement', [
                'order' => $order,
                'uploadOrder' => $uploadOrder,
                'sizes' => $sizes,
                'firstName' => $firstName,
                'lastName' => $lastName,
                'customerAddress' => $customerAddress,
                'totalAmount' => $totalAmount,
                'fabric' => $fabric, // Pass the fabric object for more details
                'totalQuantity' => $customQuantity,
                'percentageCost' => $percentageCost,
            ], [
                'customOrder' => $customOrder,
            ]);

            $fileName = 'Billing-Statement-' . $order->orderID . '.pdf';
            $filePath = 'orders/billingstatements/' . $fileName;

            Storage::disk('public')->put($filePath, $pdf->output());

            Log::info('Billing statement PDF stored successfully', ['file_path' => $filePath]);

            $fileUrl = Storage::url($filePath);

            return response()->json(['fileUrl' => $fileUrl], 200, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            Log::error('Error generating billing statement:', [
                'message' => $e->getMessage(),
                'request_data' => $request->all()
            ]);
            return response()->json(['error' => 'Failed to generate billing statement'], 500);
        }
    }
}
