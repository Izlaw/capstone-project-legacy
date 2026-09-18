<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Billing Statement</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f7fafc;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 800px;
            margin: 20px auto;
            padding: 30px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            border: 1px solid #e2e8f0;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            color: #2d3748;
        }

        .header p {
            margin: 5px 0;
            font-size: 14px;
            color: #718096;
        }

        .section {
            margin-bottom: 30px;
        }

        .section h2 {
            font-size: 24px;
            margin-bottom: 15px;
            font-weight: 500;
            color: #2d3748;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
        }

        .section p {
            margin: 0;
            font-size: 14px;
            color: #4a5568;
            line-height: 1.6;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }

        .table th,
        .table td {
            border: 1px solid #e2e8f0;
            padding: 12px 15px;
            text-align: left;
            vertical-align: top;
        }

        .table th {
            background-color: #edf2f7;
            font-weight: 600;
            color: #2d3748;
            text-transform: uppercase;
            font-size: 14px;
        }

        .table tbody tr:nth-child(even) {
            background-color: #f7fafc;
        }

        .total {
            font-size: 24px;
            font-weight: bold;
            text-align: right;
            color: #2d3748;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #718096;
        }
    </style>
</head>

<body>
    <div class="container">
        <!-- Company Information -->
        <div class="header">
            <h1 style="font-size: 24px;">7 GUYS HOUSE OF FASHION</h1>
            <p style="font-size: 14px;">Burgos - Mabini - Plaza, 6 Burgos St, La Paz, Iloilo City, 5000 Iloilo</p>
            <p style="font-size: 14px;">Contact: +123 456 7890 | email@example.com</p>
        </div>

        <div class="section">
            <h2 style="font-size: 24px;">Billing Statement</h2>
        </div>

        <!-- Customer Information -->
        <div class="section">
            <h2 style="font-size: 24px;">Customer Information</h2>
            <p style="font-size: 14px;"><strong>Name:</strong> {{ $firstName }} {{ $lastName }}</p>
            <p style="font-size: 14px;"><strong>Address:</strong> {{ $customerAddress }}</p>
        </div>

        <!-- Order Information -->
        <div class="section">
            <h2 style="font-size: 24px;">Order Information</h2>
            @if(isset($collection))
            <p style="font-size: 14px;"><strong>Order Name:</strong> {{ $collection->collectName }}</p>
            @elseif(isset($uploadOrder))
            <p style="font-size: 14px;"><strong>Order Name:</strong> {{ $uploadOrder->upName }}</p>
            @else {{-- Default to Custom Order Name (currently 'T-Shirt' via accessor) --}}
            <p style="font-size: 14px;"><strong>Order Name:</strong> {{ $order->customOrderName }}</p> {{-- Using the accessor which returns 'T-Shirt' --}}
            @endif
            <p style="font-size: 14px;"><strong>Order Date:</strong>
                {{ \Carbon\Carbon::parse($order->dateOrder)->format('M, j Y') }}
            </p>
        </div>

        <!-- Order Details -->
        <div class="section">
            <h2>Order Details</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Details</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($sizes as $size)
                    <tr>
                        <td>Size</td>
                        <td>{{ isset($size->pivot_sizeName) ? $size->pivot_sizeName : $size->sizeName }}</td>
                        <td>
                            @if(isset($size->pivot->sizePrice))
                            {{ number_format($size->pivot->sizePrice, 2) }}
                            @else
                            {{ number_format($size->sizePrice, 2) }}
                            @endif
                        </td>
                        <td>{{ isset($size->pivot->quantity) ? $size->pivot->quantity : $size->pivot_quantity }}</td>
                        <td>
                            @if(isset($size->pivot->sizePrice))
                            {{ number_format($size->pivot->sizePrice * (isset($size->pivot->quantity) ? $size->pivot->quantity : $size->pivot_quantity), 2) }}
                            @else
                            {{ number_format($size->sizePrice * (isset($size->pivot->quantity) ? $size->pivot->quantity : $size->pivot_quantity), 2) }}
                            @endif
                        </td>
                    </tr>
                    @endforeach
                    @if(isset($collection))
                    <tr>
                        <td>Collection</td>
                        <td>{{ $collection->collectName }}</td>
                        <td>{{ number_format($collectPrice, 2) }}</td>
                        <td>1</td>
                        <td>{{ number_format($collectPrice, 2) }}</td>
                    </tr>
                    @endif
                    @if(isset($fabric) && ($order->upID || isset($order->customID)))
                    <tr>
                        <td>Fabric</td>
                        <td>{{ $fabric->fabricName }}</td>
                        <td>{{ number_format($fabric->fabricPrice, 2) }}</td>
                        <td>{{ $totalQuantity }}</td>
                        <td>
                            {{ number_format($fabric->fabricPrice * $totalQuantity, 2) }}
                        </td>
                    </tr>
                    @endif
                    @if(isset($order->customID) && isset($order->customOrder->timeframe))
                    <tr>
                        <td>Timeframe</td>
                        <td>{{ $order->customOrder->timeframe->delivery_timeframe }}</td>
                        <td>{{ $percentageCost }}%</td>
                        <td>1</td>
                        <td>
                            {{ $percentageCost }}%
                        </td>
                    </tr>
                    @endif
                </tbody>
            </table>
        </div>

        <p class="total" style="font-size: 24px;">Grand Total: PHP{{ number_format($totalAmount ?? 0, 2) }}</p>

        <!-- Footer -->
        <div class="footer">
            <p style="font-size: 14px;">Thank you for your purchase!</p>
            <p style="font-size: 14px;">For inquiries, contact us at: +123 456 7890</p>
        </div>
    </div>
</body>

</html>