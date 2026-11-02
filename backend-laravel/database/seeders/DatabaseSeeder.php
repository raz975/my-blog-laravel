<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('users')->where('email', 'admin@gmail.com')->doesntExist()) {
            DB::table('users')->insert([
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'password' => Hash::make('admin12345'),
                'role' => 'admin',
                'is_blocked' => 0,
                'created_at' => now(),
            ]);
        }
    }
}