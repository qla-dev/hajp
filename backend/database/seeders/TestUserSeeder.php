<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'demo@example.com'],
            [
                'name' => 'Demo User',
                'username' => 'demo',
                'password' => Hash::make('password123'),
                'profile_photo' => null,
                'is_subscribed' => false,
            ]
        );
    }
}
