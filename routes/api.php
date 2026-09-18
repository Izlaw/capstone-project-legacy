<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/sizes', function () {
    $sizes = DB::table('sizes')->get(['sizeName', 'sizePrice', 'sizeID']);
    return response()->json($sizes);
});

Route::get('/fabric', function () {
    $fabrics = DB::table('fabrics')
        ->where('is_custom', '!=', 1)
        ->get(['fabricName', 'fabricName', 'fabricPrice', 'fabricID', 'is_custom']);
    return response()->json($fabrics);
});

Route::get('/timeframe', function () {
    $timeframe = DB::table('timeframe')->get();
    return response()->json($timeframe);
});

Route::get('/validateUser', function () {
    $users = DB::table('users')->get(['user_id', 'email', 'contact']);
    return response()->json($users);
});

Route::get('/customorders', function () {
    $customorders = DB::table('custom_orders')->get(['customID', 'modelID', 'color', 'customQuantity', 'totalAmount', 'fabric_type', 'user_id', 'sizeID']);
    return response()->json($customorders);
});

Route::get('/colors', function () {
    // Retrieve the color and customID columns from custom_orders table
    $colors = DB::table('custom_orders')->get(['color', 'customID']);
    return response()->json($colors);
});

Route::get('/latest-orders', function () {
    $orders = DB::table('orders')
        ->join('users', 'orders.user_id', '=', 'users.user_id')
        ->select('orders.orderID', 'orders.orderStatus', 'users.first_name', 'users.last_name')
        ->orderBy('orders.orderID', 'desc')
        ->take(10)
        ->get();

    return response()->json($orders);
});
