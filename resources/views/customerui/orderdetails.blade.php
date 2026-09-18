<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Details</title>
    @vite('resources/css/app.css')
    @vite('resources/js/app.js')
    @include('layouts.header')
</head>

<body class="bg-secondary">
    <!-- Go back button -->
    @if (Auth::user()->isAdmin())
    <x-backbutton route="adminOrder" />
    @elseif (Auth::user()->isEmployee())
    <x-backbutton route="empManageOrder" />
    @elseif (Auth::user()->isCustomer())
    <x-backbutton route="vieworder" />
    @endif

    <!-- Main Order Details Container with relative positioning -->
    <div class="orderDetailsContainer relative bg-opacity-90 p-8 rounded-lg shadow-lg max-w-screen-lg mx-auto">

        <!-- Icon Links Container -->
        <!-- <div class="absolute top-32 right-20 transform -translate-y-1/2 flex space-x-4">
            @if ($fileExists)
            <a href="{{ asset('storage/' . $billingFilePath) }}" target="_blank"
                class="hover:scale-110 transition transform" title="Download Billing Statement">
                <i class="fas fa-file-invoice text-deep text-2xl"></i>
            </a>
            @else
            <span class="text-red-500" title="Billing statement not available">
                <i class="fas fa-file-invoice text-2xl"></i>
            </span>
            @endif

            @if ($order->customID)
            <a href="{{ route('download.qrcode', $order->customOrder->customID) }}"
                class="hover:scale-110 transition transform" title="Download QR Code">
                <i class="fas fa-qrcode text-deep text-2xl"></i>
            </a>
            @endif
        </div> -->

        <!-- Header -->
        <div class="text-center text-white mb-8">
            <h1 class="text-4xl font-bold text-highlight">Order Details</h1>
        </div>

        <!-- Customer Details Section -->
        @if (Auth::user()->isAdmin() || Auth::user()->isEmployee())
        <div class="mx-auto p-6 bg-white rounded-lg shadow-lg w-full max-w-4xl space-y-6 mb-8">
            <div class="space-y-4">
                <p class="text-xl font-semibold text-secondary">Customer Information</p>
                <p><strong>Name:</strong> {{ $user->fullCustomerName() ?? 'N/A' }}</p>
                <p><strong>Email:</strong> {{ $user->email ?? 'N/A' }}</p>
                <p><strong>Contact:</strong> {{ $user->contact ?? 'N/A' }}</p>
                <p><strong>Address:</strong> {{ $user->address ?? 'N/A' }}</p>
            </div>
        </div>
        @endif

        <!-- Order Details Section -->
        <div class="mx-auto p-6 bg-white rounded-lg shadow-lg w-full max-w-4xl space-y-6 mb-8">
            <div class="space-y-4">
                <p class="text-xl font-semibold text-secondary">Order Information</p>
                <p><strong>Total Price:</strong> ₱{{ number_format($order->orderTotal, 2) ?? 'N/A' }}</p>
                <p>
                    <strong>Order Status:</strong>
                    <span class="inline-block px-2 py-1 rounded-full 
            @if($order->orderStatus === 'Pending') bg-yellow-400 text-black 
            @elseif($order->orderStatus === 'In Progress') bg-blue-500 text-white 
            @elseif($order->orderStatus === 'Ready for Pickup') bg-green-500 text-white 
            @elseif($order->orderStatus === 'Completed') bg-gray-500 text-white 
            @elseif($order->orderStatus === 'Cancelled') bg-red-500 text-white 
            @else bg-gray-300 text-black 
            @endif">
                        {{ $order->orderStatus ?? 'N/A' }}
                    </span>
                </p>
                <p><strong>Quantity:</strong> {{ $order->orderQuantity ?? 'N/A' }}</p>
                <p><strong>Date Ordered:</strong> {{ \Carbon\Carbon::parse($order->dateOrder)->format('M, j Y') }}</p>
                <p><strong>Date Received:</strong> {{ $order->dateReceived ? \Carbon\Carbon::parse($order->dateReceived)->format('M, j Y') : 'N/A' }}</p>
            </div>
        </div>

        <!-- Order Type Section -->
        @if ($order->customID)
        <div class="mx-auto p-6 bg-white rounded-lg shadow-lg w-full max-w-4xl space-y-4 mb-8">
            <p class="text-xl font-semibold text-secondary">Custom Order Details</p>
            <p><strong>Custom Order Name:</strong> T-Shirt</p>
            <p>
                <strong>Colors:</strong>
                @php
                $colors = $order->customOrder->colors;
                @endphp
            <div class="flex space-x-4 mt-2">
                @foreach($colors as $key => $color)
                <div class="flex flex-col items-center">
                    <div class="w-6 h-6 rounded-full border" style="background-color: {{ $color }};"></div>
                    <span class="text-xs capitalize">{{ $key }}</span>
                    <span class="text-xs">{{ $color }}</span> {{-- Display hex value --}}
                </div>
                @endforeach
            </div>
            </p>
            <div class="mt-4">
                <p><strong>Sizes:</strong></p>
                @if($order->customOrder->sizes->isNotEmpty())
                <table class="min-w-full table-auto">
                    <thead>
                        <tr>
                            <th class="px-2 py-1 text-left font-semibold">Size</th>
                            <th class="px-2 py-1 text-left font-semibold">Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($order->customOrder->sizes as $size)
                        <tr>
                            <td class="border px-2 py-1">{{ $size->sizeName }}</td>
                            <td class="border px-2 py-1">{{ $size->pivot->quantity }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
                @else
                <p class="text-gray-500">N/A</p>
                @endif
            </div>
            <p class="mt-4"><strong>Fabric Type:</strong> {{ ucfirst($order->customOrder->fabric->fabricName ?? 'N/A') }}</p>
        </div>
        @elseif ($order->collectID)
        <div class="mx-auto p-6 bg-white rounded-lg shadow-lg w-full max-w-4xl space-y-6 mb-8">
            <p class="text-xl font-semibold text-secondary">Collection Order Details</p>
            <p><strong>Collection Name:</strong> {{ $order->collection->collectName ?? 'N/A' }}</p>
            <p><strong>Sizes:</strong></p>
            @if($order->collections->isNotEmpty())
            <table class="min-w-full table-auto">
                <thead>
                    <tr>
                        <th class="px-2 py-1 text-left font-semibold">Size</th>
                        <th class="px-2 py-1 text-left font-semibold">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->collections as $collection)
                    <tr>
                        <td class="border px-2 py-1">{{ $collection->pivot->sizeName }}</td>
                        <td class="border px-2 py-1">{{ $collection->pivot->quantity }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            @else
            <p class="text-gray-500">N/A</p>
            @endif
            @if(isset($order->collection->fabric_type))
            <p class="mt-4"><strong>Fabric Type:</strong> {{ ucfirst($order->collection->fabric_type) ?? 'N/A' }}</p>
            @endif
        </div>
        @elseif ($order->upID)
        <div class="mx-auto p-6 bg-white rounded-lg shadow-lg w-full max-w-4xl space-y-6 mb-8">
            <p class="text-xl font-semibold text-secondary">Upload Order Details</p>
            <p><strong>Upload Order Name:</strong> {{ ucfirst($order->uploadOrder->upName ?? 'N/A') }}</p>
            <p><strong>Sizes:</strong></p>
            @if($order->uploadOrder->sizes->isNotEmpty())
            <table class="min-w-full table-auto">
                <thead>
                    <tr>
                        <th class="px-2 py-1 text-left font-semibold">Size</th>
                        <th class="px-2 py-1 text-left font-semibold">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->uploadOrder->sizes as $size)
                    <tr>
                        <td class="border px-2 py-1">{{ $size->sizeName }}</td>
                        <td class="border px-2 py-1">{{ $size->pivot->quantity }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            @else
            <p class="text-gray-500">N/A</p>
            @endif
            @if($order->uploadOrder->fabric) {{-- Check if fabric relationship exists --}}
            @if($order->uploadOrder->fabric->is_custom) {{-- Check if the fabric is custom --}}
            <p class="mt-4"><strong>Fabric Type:</strong> {{ $order->uploadOrder->fabric->fabricName ?? 'Custom Fabric' }}</p> {{-- Display custom fabric name --}}
            @else
            <p class="mt-4"><strong>Fabric Type:</strong> {{ $order->uploadOrder->fabric->fabricName ?? 'N/A' }}</p> {{-- Display standard fabric name --}}
            @endif
            @else
            <p class="mt-4"><strong>Fabric Type:</strong> N/A</p> {{-- Handle case where fabric relationship is null --}}
            @endif
        </div>
        @else
        <div class="mx-auto p-6 bg-white rounded-lg shadow-lg w-full max-w-4xl space-y-6 mb-8">
            <p class="text-xl font-semibold text-secondary">Order Type: Unknown</p>
        </div>
        @endif
    </div>
</body>

</html>