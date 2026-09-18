<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CollectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('existing_design')->insert([
            [
                'collectName' => 'ISAT-U T-Shirt',
                'collectPrice' => 800,
                'collectFilePath' => 'collections/isatu.png',
            ],
            [
                'collectName' => 'Platypus T-Shirt',
                'collectPrice' => 1500,
                'collectFilePath' => 'collections/platypus.png',
            ],
            [
                'collectName' => 'Midnight T-Shirt',
                'collectPrice' => 1300,
                'collectFilePath' => 'collections/midnight.png',
            ],
            [
                'collectName' => 'Bini T-Shirt',
                'collectPrice' => 1500,
                'collectFilePath' => 'collections/bini.png',
            ],
            [
                'collectName' => 'Dust Storm T-Shirt',
                'collectPrice' => 500,
                'collectFilePath' => 'collections/dust-storm.png',
            ],
            [
                'collectName' => 'Gulf Blue T-Shirt',
                'collectPrice' => 1200,
                'collectFilePath' => 'collections/gulf-blue.png',
            ],
            [
                'collectName' => 'Harvest Gold T-Shirt',
                'collectPrice' => 1100,
                'collectFilePath' => 'collections/harvest-gold.png',
            ],
            [
                'collectName' => 'Tupad T-Shirt',
                'collectPrice' => 700,
                'collectFilePath' => 'collections/tupad.png',
            ],
            [
                'collectName' => 'Listen and Look T-Shirt',
                'collectPrice' => 1000,
                'collectFilePath' => 'collections/listen.png',
            ],
        ]);
    }
}
