<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id('user_id');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role')->default('customer');
            $table->string('sex')->check(DB::raw('sex in ("Male", "Female", "Other")'));
            $table->date('bday');
            $table->string('contact');
            $table->string('address');
            $table->boolean('archived')->default(false);
        });

        // Insert default users - moved to seeder
    }

    public function down()
    {
        DB::table('users')->whereIn('email', [
            'admin@example.com',
            'customer1@example.com',
            'customer2@example.com',
            'employee1@example.com',
            'employee2@example.com',
        ])->delete();

        Schema::dropIfExists('users');
    }
};
