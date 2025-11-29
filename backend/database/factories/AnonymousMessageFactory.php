<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AnonymousMessage>
 */
class AnonymousMessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'inbox_id' => 1,
            'message' => $this->faker->sentence(),
            'metadata' => ['hint' => $this->faker->randomElement(['boy','girl'])],
        ];
    }
}
