<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Poll>
 */
class PollFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'question' => $this->faker->sentence(),
            'options' => [$this->faker->firstName(), $this->faker->firstName(), $this->faker->firstName(), $this->faker->firstName()],
            'creator_id' => 1,
            'target_school' => 'Demo High School',
            'active' => true,
        ];
    }
}
