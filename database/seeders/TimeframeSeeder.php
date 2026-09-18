<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Timeframe; // Import the Timeframe model
use Illuminate\Support\Facades\DB; // Import DB facade if needed for raw queries or transactions

class TimeframeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('timeframe')->insert([
            // ['delivery_timeframe' => 'days', 'cost' => 100.00],
            ['delivery_timeframe' => '1 week', 'percentageCost' => 25.00, 'maximum_orders' => 150],
            ['delivery_timeframe' => '2 weeks', 'percentageCost' => 15.00, 'maximum_orders' => 300],
            ['delivery_timeframe' => '3 weeks', 'percentageCost' => 5.00, 'maximum_orders' => 450],
        ]);
    }
}
