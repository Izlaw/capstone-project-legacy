<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->insert([
            [
                'first_name' => 'Estanislao',
                'last_name' => 'Delariarte',
                'email' => 'edelariarte@gmail.com',
                'password' => bcrypt('12345678'), // Change as needed
                'role' => 'admin',
                'sex' => 'Male',
                'bday' => '2003-06-20',
                'contact' => '0976-225-4643',
                'address' => 'Zarraga',
            ],
            [
                'first_name' => 'Angeline',
                'last_name' => 'Griño',
                'email' => 'agrino@gmail.com',
                'password' => bcrypt('12345678'),
                'role' => 'customer',
                'sex' => 'Female',
                'bday' => '2002-02-01',
                'contact' => '0928-765-4321',
                'address' => 'Leganes',
            ],
            [
                'first_name' => 'Ghee Pee',
                'last_name' => 'Mamon',
                'email' => 'gpmamon@gmail.com',
                'password' => bcrypt('12345678'),
                'role' => 'customer',
                'sex' => 'Male',
                'bday' => '2003-04-14',
                'contact' => '0923-817-2938',
                'address' => 'Jaro',
            ],
            [
                'first_name' => 'Bevelyn',
                'last_name' => 'Tamallana',
                'email' => 'btamallana@gmail.com',
                'password' => bcrypt('12345678'),
                'role' => 'employee',
                'sex' => 'Female',
                'bday' => '2002-09-12',
                'contact' => '0912-327-8724',
                'address' => 'Tigbauan',
            ],
            [
                'first_name' => 'John Paul',
                'last_name' => 'Cordero',
                'email' => 'jpaulcordero@gmail.com',
                'password' => bcrypt('12345678'),
                'role' => 'employee',
                'sex' => 'Male',
                'bday' => '2002-05-29',
                'contact' => '0922-421-4982',
                'address' => 'La Paz',
            ],
        ]);
    }
}
