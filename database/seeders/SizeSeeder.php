<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SizeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('sizes')->insert([
            ['sizeName' => '4XS', 'sizePrice' => 280.00],
            ['sizeName' => '3XS', 'sizePrice' => 285.00],
            ['sizeName' => '2XS', 'sizePrice' => 290.00],
            ['sizeName' => 'XS', 'sizePrice' => 295.00],
            ['sizeName' => 'S', 'sizePrice' => 300.00],
            ['sizeName' => 'M', 'sizePrice' => 300.00],
            ['sizeName' => 'L', 'sizePrice' => 300.00],
            ['sizeName' => 'XL', 'sizePrice' => 310.00],
            ['sizeName' => 'XXL', 'sizePrice' => 320.00],
            ['sizeName' => 'XXXL', 'sizePrice' => 330.00],
            ['sizeName' => '4XL', 'sizePrice' => 340.00],
            ['sizeName' => '5XL', 'sizePrice' => 350.00],
            ['sizeName' => '6XL', 'sizePrice' => 360.00],
        ]);
    }
}
