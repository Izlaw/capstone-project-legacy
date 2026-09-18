<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::create('sizes', function (Blueprint $table) {
            $table->id('sizeID');         // Primary key for size
            $table->string('sizeName');    // Name of the size (e.g., 'XS', 'Small', etc.)
            $table->integer('sizeQuantity')->default(0); // Column for size quantity
            $table->decimal('sizePrice', 10, 2); // New column for size price
            $table->boolean('archived')->default(false);
        });

        // Insert initial size data directly in the migration - moved to seeder
    }

    public function down()
    {
        Schema::dropIfExists('sizes');
    }
};
