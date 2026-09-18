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
            <p style="font-size: 14px;"><strong>Name:</strong> John Doe</p>
            <p style="font-size: 14px;"><strong>Address:</strong> 123 Main Street</p>
        </div>

        <!-- Order Information -->
        <div class="section">
            <h2 style="font-size: 24px;">Order Information</h2>
            <p style="font-size: 14px;"><strong>Order Name:</strong> T-Shirt</p>
            <p style="font-size: 14px;"><strong>Order Date:</strong> Apr 12, 2025</p>
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
                    @php
                    $orderType = 'upload'; // Possible values: 'custom', 'upload', 'collection'
                    $sizeSubtotal = 0;
                    $fabricPrice = 0;
                    $timeframeCost = 0;
                    $grandTotal = 0;
                    @endphp
                    @if ($orderType === 'upload' )
                    <tr>
                        <td>Size</td>
                        <td>Large</td>
                        <td>100.00</td>
                        <td>2</td>
                        <td>
                            @php
                            $sizeSubtotal += 200;
                            @endphp
                            200.00
                        </td>
                    </tr>
                    <tr>
                        <td>Size</td>
                        <td>Medium</td>
                        <td>90.00</td>
                        <td>1</td>
                        <td>
                            @php
                            $sizeSubtotal += 90;
                            @endphp
                            90.00
                        </td>
                    </tr>
                    <tr>
                        <td>Fabric</td>
                        <td>Cotton</td>
                        <td>300.00</td>
                        <td>1</td>
                        <td>
                            @php
                            $fabricPrice = 300;
                            @endphp
                            300.00
                        </td>
                    </tr>
                    <td>2 Weeks</td>
                    <td>100.00</td>
                    <td>1</td>
                    <td>
                        @php
                        $timeframeCost = 100;
                        @endphp
                        100.00
                    </td>
                    </tr>
                    @elseif ($orderType === 'collection')
                    <tr>
                        <td>Collection</td>
                        <td>Sample Collection</td>
                        <td>500.00</td>
                        <td>1</td>
                        <td>
                            @php
                            $grandTotal = 500;
                            @endphp
                            500.00
                        </td>
                    </tr>
                    @endif
                </tbody>
            </table>
            @php
            $grandTotal = $sizeSubtotal + $fabricPrice + $timeframeCost;
            @endphp
            <p style="font-size: 14px; text-align: right;">Subtotal: PHP{{ number_format($grandTotal, 2) }}</p>
        </div>

        <p class="total" style="font-size: 24px;">Grand Total: PHP{{ number_format($grandTotal, 2) }}</p>

        <!-- Footer -->
        <div class="footer">
            <p style="font-size: 14px;">Thank you for your purchase!</p>
            <p style="font-size: 14px;">For inquiries, contact us at: +123 456 7890</p>
        </div>
    </div>
</body>

</html>