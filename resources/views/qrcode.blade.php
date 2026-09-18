<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Code and Billing Statement</title>
    @vite('resources/css/app.css')
    @vite('resources/js/app.js')
</head>

<body>
    <div id="tshirtPreviewContainer" class="p-4">
        <!-- Display the QR Code -->
        <div id="qrCodeContainer" class="flex justify-center mt-4">
            <img src="{{ $qrCode }}" alt="QR Code">
        </div>

        <p class="mt-2 text-center text-white">Scan this QR code to view your customized design!</p>
        <div class="flex justify-center mt-4">
            <a href="{{ route('chat', ['convoID' => $conversation->convoID]) }}" class="text-white hover:underline mr-2">
                <i class="bi bi-chat-dots-fill text-2xl text-deep hover:text-highlight"></i>
            </a>
            <a href="{{ asset('storage/' . $billingFilePath) }}" target="_blank" class="text-white hover:underline mr-2">
                <i class="fas fa-file-invoice text-2xl text-deep hover:text-highlight"></i>
            </a>
            <a href="{{ route('download.qrcode', ['customID' => $order->customID]) }}" class="text-white hover:underline">
                <i class="fas fa-qrcode text-2xl text-deep hover:text-highlight"></i>
            </a>
        </div>
    </div>
</body>

</html>