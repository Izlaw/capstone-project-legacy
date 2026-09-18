<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; // Import DB facade

class FabricSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('fabrics')->insert([
            ['fabricName' => 'Custom', 'fabricPrice' => 500.00, 'is_custom' => false],
            ['fabricName' => 'Polyester', 'fabricPrice' => 300.00, 'is_custom' => false],
            // ['fabricName' => 'Wool', 'fabricPrice' => 250.00, 'is_custom' => false],
            ['fabricName' => 'Cotton', 'fabricPrice' => 120.00, 'is_custom' => false],

        ]);
    }
}
