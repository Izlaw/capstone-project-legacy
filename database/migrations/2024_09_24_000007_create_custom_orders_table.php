<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('custom_orders', function (Blueprint $table) {
            $table->id('customID'); // Primary key
            $table->json('colors'); // Store colors as JSON
            $table->json('text')->nullable(); // Add new column for text customizations
            $table->integer('customQuantity');
            $table->decimal('totalAmount', 10, 2)->default(0.00);
            $table->unsignedBigInteger('fabricID');
            $table->unsignedBigInteger('timeframeID')->nullable(); // Foreign key to timeframe table (nullable)
            $table->unsignedBigInteger('user_id'); // Foreign key to users table (not nullable)

            // Foreign keys
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade'); // Cascade delete when user is deleted
            $table->foreign('fabricID')->references('fabricID')->on('fabrics')->onDelete('cascade');
            $table->foreign('timeframeID')->references('timeframeID')->on('timeframe')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('custom_orders');
    }
};
