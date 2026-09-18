<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Preview</title>
    @vite('resources/css/app.css')
    @vite('resources/js/app.js')
    @include('layouts.header')
</head>


<body class="bg-secondary bg-cover overflow-y-hidden"
    data-model="T-Shirt"
    data-colors='@json($customOrder->colors ?? [])'
    data-text='@json($customOrder->text)'>
    <div class="flex h-screen">
        <x-backbutton route="{{ ('vieworder') }}" />

        <!-- Left Sidebar: Order Details -->
        <div class="bg-secondary w-1/4 shadow-lg p-6 border-r-2 border-highlight text-white overflow-y-auto">
            <h1 class="text-2xl font-semibold text-center mb-6">Order Preview</h1>

            <!-- Customer Details Section -->
            <div class="mb-6">
                <h2 class="text-xl font-semibold text-highlight mb-2">Customer Details</h2>
                <div class="space-y-2 text-gray-300">
                    <p><strong>Name:</strong> {{ $customOrder->user->fullCustomerName }}</p>
                    <p><strong>Address:</strong> {{ $customOrder->user->address }}</p>
                    <p><strong>Email:</strong> {{ $customOrder->user->email }}</p>
                    <p><strong>Contact:</strong> {{ $customOrder->user->contact }}</p>
                </div>
            </div>

            <!-- Order Details Section -->
            <div class="mb-6">
                <h2 class="text-xl font-semibold text-highlight mb-2">Order Details</h2>
                <div class="space-y-2 text-gray-300">
                    @php
                    $orderStatus = $customOrder->orders->first()->orderStatus ?? 'N/A';
                    @endphp
                    <strong>Order Status:
                        <span class="px-2 py-1 rounded-full text-sm font-medium
                            @if ($orderStatus == 'Pending') bg-yellow-400 text-black
                            @elseif ($orderStatus == 'In Progress') bg-blue-500 text-white
                            @elseif ($orderStatus == 'Ready for Pickup') bg-green-500 text-white
                            @elseif ($orderStatus == 'Completed') bg-gray-500 text-white
                            @elseif ($orderStatus == 'Cancelled') bg-red-500 text-white
                            @else bg-gray-300 text-black
                            @endif">
                            {{ $orderStatus }}
                        </span>
                    </strong>

                    <p><strong>Timeframe:</strong> {{ $customOrder->timeframe->delivery_timeframe ?? 'N/A' }}</p>
                    <p><strong>Fabric Type:</strong> {{ ucfirst($customOrder->fabric->fabricName ?? 'N/A') }}</p>

                    @php
                    $colors = $customOrder->colors ?? [];
                    @endphp
                    <p>
                        <strong>Color(s):</strong>
                        @foreach($colors as $color)
                        <span class="inline-block w-4 h-4 rounded-full mr-1" style="background-color: {{ $color }};"></span>
                        @endforeach
                        ({{ implode(', ', $colors) }})
                    </p>

                    <table class="min-w-full bg-primary">
                        <thead>
                            <tr>
                                <th class="py-2 px-4 bg-accent text-left text-xs font-semibold text-white uppercase tracking-wider">Size</th>
                                <th class="py-2 px-4 bg-accent text-left text-xs font-semibold text-white uppercase tracking-wider">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            @if($customOrder->sizes && $customOrder->sizes->count())
                            @foreach($customOrder->sizes as $size)
                            <tr>
                                <td class="py-2 px-4 border-b border-gray-200">
                                    @switch($size->sizeName)
                                    @case(' xs') Extra Small @break
                                    @case('xl') Extra Large @break
                                    @default {{ ucfirst($size->sizeName) }}
                                    @endswitch
                                </td>
                                <td class="py-2 px-4 border-b border-gray-200">{{ $size->pivot->quantity }}</td>
                            </tr>
                            @endforeach
                            @else
                            <tr>
                                <td class="py-2 px-4 border-b border-gray-200" colspan="2">N/A</td>
                            </tr>
                            @endif
                        </tbody>
                    </table>

                    <p><strong>Total Quantity:</strong> {{ $customOrder->customQuantity }}</p>
                </div>
            </div>

            <!-- Total Amount Section -->
            <p class="text-xl font-semibold mb-10 text-highlight"><strong>Total Amount:</strong> ₱{{ number_format($customOrder->totalAmount, 2) }}</p>

        </div>

        <!-- Right: T-Shirt Canvas Display -->
        <div class="flex-1">
            <canvas id="tshirtCanvas" class="w-full h-full shadow-xl"></canvas>
        </div>
    </div>
</body>

</html>