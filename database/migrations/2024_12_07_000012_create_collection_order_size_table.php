<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('existing_design_order_size', function (Blueprint $table) {
            $table->id('edordersizeID');
            $table->unsignedBigInteger('orderID');
            $table->unsignedBigInteger('collectID');
            $table->unsignedBigInteger('sizeID');
            $table->integer('quantity');

            $table->foreign('orderID')->references('orderID')->on('orders')->onDelete('cascade');
            $table->foreign('collectID')->references('collectID')->on('existing_design')->onDelete('cascade');
            $table->foreign('sizeID')->references('sizeID')->on('sizes')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('existing_design_order_size');
    }
};
