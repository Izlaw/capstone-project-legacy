<div>

    <head>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet">
    </head>

    @if(auth()->user()->isAdmin() || auth()->user()->isEmployee())
    <h1 class="text-4xl text-highlight font-extrabold mb-6">Manage Orders</h1>
    <div class="w-full h-[calc(100vh-13rem)] overflow-y-auto">
        <table class="table-auto w-full rounded-lg shadow-xl bg-white text-center">
            <thead class="sticky top-0 bg-primary text-highlight z-10">
                <tr class="bg-primary text-highlight">
                    <th class="px-6 py-4 text-sm text-white">CUSTOMER NAME</th>
                    <th class="px-6 py-4 text-sm text-white">SIZE</th>
                    <th class="px-6 py-4 text-sm text-white">TOTAL QUANTITY</th>
                    <th class="px-6 py-4 text-sm text-white">TOTAL PRICE</th>
                    <th class="px-6 py-4 text-sm text-white">DATE ORDERED</th>
                    <th class="px-6 py-4 text-sm text-white">DATE RECEIVED</th>
                    <th class="px-6 py-4 text-sm text-white">STATUS</th>
                    <th class="px-6 py-4 text-sm text-white">ORDER TYPE</th>
                    <th class="px-6 py-4 text-sm text-white">ACTIONS</th>
                </tr>
            </thead>
            <tbody>
                @foreach($orders as $order)
                <tr class="group border-b border-gray-300 text-black hover:bg-accent transition-all duration-200 hover:text-white cursor-pointer" onclick="window.location.href='{{ route('orderdetails', $order->orderID) }}'">

                    <td class="px-6 py-4">
                        {{ $order->user->first_name ?? 'N/A' }} {{ $order->user->last_name ?? 'N/A' }}
                    </td>

                    <td class="px-6 py-4">
                        @if ($order->customID)
                        @if($order->customOrder->sizes->isNotEmpty())
                        @foreach($order->customOrder->sizes as $size)
                        <span>{{ $size->sizeName }}: {{ $size->pivot->quantity }}</span>
                        @endforeach
                        @else
                        N/A
                        @endif
                        @elseif ($order->upID)
                        @if($order->uploadOrder->sizes->isNotEmpty())
                        @foreach($order->uploadOrder->sizes as $size)
                        <span>{{ $size->sizeName }}: {{ $size->pivot->quantity }}</span>
                        @endforeach
                        @else
                        N/A
                        @endif
                        @elseif ($order->collectID)
                        @if($order->collections->isNotEmpty())
                        @foreach($order->collections as $collection)
                        <span>{{ $collection->pivot->sizeName }}: {{ $collection->pivot->quantity }}</span>
                        @endforeach
                        @else
                        N/A
                        @endif
                        @else
                        N/A
                        @endif
                    </td>

                    <td class="px-6 py-4">{{ $order->orderQuantity }}</td>
                    <td class="px-6 py-4" onclick="event.stopPropagation();">
                        @if(auth()->user()->isAdmin() && $editing !== $order->orderID)
                        <span
                            class="cursor-text hover:bg-gray-100 hover:text-black px-2 py-1 rounded"
                            wire:click="editPrice({{ $order->orderID }})">
                            ₱{{ number_format($order->orderTotal, 2) }}
                        </span>
                        @elseif($editing === $order->orderID)
                        <input
                            type="number"
                            step="0.01"
                            class="w-24 px-2 py-1 border rounded text-black"
                            wire:model="newPrice"
                            wire:keydown.enter="savePrice()"
                            wire:blur="savePrice()"
                            id="price-input-{{ $order->orderID }}"
                            x-data="{}"
                            x-init="$nextTick(() => { $el.focus(); })" />
                        @else
                        ₱{{ number_format($order->orderTotal, 2) }}
                        @endif
                    </td>
                    <td class="px-6 py-4">{{ \Carbon\Carbon::parse($order->dateOrder)->format('M, j Y') }}</td>
                    <td class="px-6 py-4">
                        {{ $order->dateReceived ? \Carbon\Carbon::parse($order->dateReceived)->format('M, j Y') : 'N/A' }}
                    </td>

                    <td class="px-6 py-4" onclick="event.stopPropagation();">
                        <livewire:order-status
                            :orderId="$order->orderID"
                            wire:key="status-{{ $order->orderID }}-{{ $order->orderStatus }}" />
                    </td>

                    <td class="px-6 py-4">
                        @if ($order->collectID)
                        Collection Order
                        @elseif ($order->customID)
                        Custom Order
                        @elseif ($order->upID)
                        Upload Order
                        @else
                        N/A
                        @endif
                    </td>

                    <td class="px-6 py-4 text-center flex items-center justify-center space-x-2" wire:ignore onclick="event.stopPropagation();">
                        @if($order->convoID)
                        <a href="{{ route('chat.recipient', ['recipient' => $order->convoID]) }}"
                            class="text-black transition-colors group-hover:text-white text-xl inline-flex items-center justify-center" title="Chat">
                            <i class="bi bi-chat-dots align-middle inline-block"></i>
                        </a>
                        @endif
                        @if ($order->billingStatementExists)
                        <a href="{{ asset('storage/orders/billingstatements/Billing-Statement-' . $order->orderID . '.pdf') }}" target="_blank"
                            class="text-black transition-colors group-hover:text-white text-xl inline-flex items-center justify-center" title="Billing Statement">
                            <i class="fas fa-file-invoice align-middle inline-block"></i>
                        </a>
                        @else
                        <span class="text-gray-400 text-xl inline-flex items-center justify-center" title="Billing Statement not available">
                            <i class="fas fa-file-invoice align-middle inline-block"></i>
                        </span>
                        @endif
                        @if ($order->customID)
                        <a href="{{ route('download.qrcode', $order->customOrder->customID) }}"
                            class="text-black transition-colors group-hover:text-white text-xl inline-flex items-center justify-center" title="QR Code">
                            <i class="fas fa-qrcode align-middle inline-block"></i>
                        </a>
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    @elseif(auth()->user()->isCustomer())

    <div wire:poll.1s="reloadOrders">
        <h1 class="text-4xl text-highlight font-extrabold mb-6">Your Orders</h1>
        <div class="w-full max-w-7xl h-[calc(100vh-13rem)] overflow-y-auto">
            <table class="table-auto w-full text-center rounded-lg shadow-xl bg-white">
                <thead class="sticky top-0 bg-primary text-highlight z-10">
                    <tr class="bg-primary text-highlight">
                        <th class="px-6 py-4 text-sm text-white">ORDER NAME</th>
                        <th class="px-6 py-4 text-sm text-white">TOTAL PRICE</th>
                        <th class="px-6 py-4 text-sm text-white text-center">STATUS</th>
                        <th class="px-6 py-4 text-sm text-white">DATE ORDERED</th>
                        <th class="px-6 py-4 text-sm text-white">DATE RECEIVED</th>
                        <th class="px-6 py-4 text-sm text-white">ORDER TYPE</th>
                        <th class="px-6 py-4 text-sm text-white">ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($orders as $order)
                    <tr class="group border-b border-gray-300 text-white hover:bg-white transition-all duration-200 hover:text-black bg-accent cursor-pointer"
                        onclick="window.location.href='{{ route('orderdetails', $order->orderID) }}'">

                        <td class="px-6 py-4">
                            @if ($order->collectID)
                            {{ ucfirst($order->collection->collectName ?? 'N/A') }}
                            @elseif ($order->customID)
                            T-Shirt
                            @elseif ($order->upID)
                            {{ ucfirst($order->uploadOrder->upName ?? 'N/A') }}
                            @else
                            N/A
                            @endif
                        </td>

                        <td class="px-6 py-4">₱{{ number_format($order->orderTotal, 2) }}</td>

                        <td class="px-6 py-4">
                            <livewire:order-status
                                :orderId="$order->orderID"
                                wire:key="status-{{ $order->orderID }}-{{ $order->orderStatus }}" />
                        </td>

                        <td class="px-6 py-4">{{ \Carbon\Carbon::parse($order->dateOrder)->format('M, j Y') }}</td>

                        <td class="px-6 py-4">
                            {{ $order->dateReceived ? \Carbon\Carbon::parse($order->dateReceived)->format('M, j Y') : 'N/A' }}
                        </td>

                        <td class="px-6 py-4">
                            @if ($order->collectID)
                            Collection Order
                            @elseif ($order->customID)
                            Custom Order
                            @elseif ($order->upID)
                            Upload Order
                            @else
                            Other
                            @endif
                        </td>

                        <td class="px-6 py-4 text-center flex items-center justify-center space-x-2" wire:ignore wire:ignore onclick="event.stopPropagation();">
                            @if($order->convoID)
                            <a href="{{ route('chat.recipient', ['recipient' => $order->convoID]) }}"
                                class="text-white transition-colors group-hover:text-black text-xl" title="Chat">
                                <i class="bi bi-chat-dots"></i>
                            </a>
                            @endif
                            @if ($order->billingStatementExists)
                            <a href="{{ asset('storage/orders/billingstatements/Billing-Statement-' . $order->orderID . '.pdf') }}" target="_blank"
                                class="text-white transition-colors group-hover:text-black text-xl" title="Billing Statement">
                                <i class="fas fa-file-invoice"></i>
                            </a>
                            @else
                            <span class="text-gray-400 text-xl" title="Billing Statement not available">
                                <i class="fas fa-file-invoice"></i>
                            </span>
                            @endif
                            @if ($order->customID)
                            <a href="{{ route('download.qrcode', $order->customOrder->customID) }}"
                                class="text-white transition-colors group-hover:text-black text-xl" title="QR Code">
                                <i class="fas fa-qrcode"></i>
                            </a>
                            @endif
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
    @endif
</div>