<?php

namespace Database\Seeders;

use App\Models\AnonymousInbox;
use App\Models\AnonymousMessage;
use App\Models\Poll;
use App\Models\Question;
use App\Models\QuestionVote;
use App\Models\Room;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $schools = [
            'Newton North High School',
            'Newton South High School',
            'Brighton High School',
            'Watertown High School',
            'Learning Prep School',
        ];

        $grades = ['9th Grade', '10th Grade', '11th Grade', '12th Grade'];

        $users = [];
        $firstNames = ['Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn',
            'Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas', 'Henry', 'Alexander',
            'Emily', 'Abigail', 'Ella', 'Scarlett', 'Grace', 'Chloe', 'Victoria', 'Riley', 'Aria', 'Lily',
            'Mason', 'Ethan', 'Logan', 'Jacob', 'Michael', 'Daniel', 'Jackson', 'Sebastian', 'Jack', 'Aiden',
            'Madison', 'Layla', 'Zoe', 'Penelope', 'Lillian', 'Addison', 'Aubrey', 'Hannah', 'Zoey', 'Nora'];

        $lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
            'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
            'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
            'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
            'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

        foreach ($firstNames as $index => $firstName) {
            $lastName = $lastNames[$index];
            $school = $schools[array_rand($schools)];
            $grade = $grades[array_rand($grades)];

            $user = User::create([
                'name' => $firstName . ' ' . $lastName,
                'email' => strtolower($firstName . '.' . $lastName . '@school.com'),
                'password' => Hash::make('password123'),
                'school' => $school,
                'grade' => $grade,
                'profile_photo' => null,
                'is_subscribed' => rand(0, 1) === 1,
            ]);

            AnonymousInbox::create([
                'user_id' => $user->id,
                'share_link' => 'https://hajp.app/inbox/' . strtolower($firstName . $lastName),
            ]);

            if ($user->is_subscribed) {
                Subscription::create([
                    'user_id' => $user->id,
                    'expires_at' => now()->addMonth(),
                ]);
            }

            $users[] = $user;
        }

        // Rooms per school
        $rooms = [];
        foreach ($schools as $schoolName) {
            $rooms[$schoolName] = Room::create([
                'name' => $schoolName,
                'type' => 'school',
                'is_18_over' => false,
            ]);
        }

        // Seed questions and polls
        $pollQuestions = [
            ['question' => 'Smiling 24/7', 'emoji' => '😊'],
            ['question' => 'Was probably a cat in their past life', 'emoji' => '🐱'],
            ['question' => 'Should be kept away from anything flammable', 'emoji' => '🔥'],
            ['question' => 'Wanna invite them over to my house', 'emoji' => '🏠'],
            ['question' => 'Style you would like to steal', 'emoji' => '🧥'],
            ['question' => 'Low key, I really like their political views', 'emoji' => '🗳️'],
            ['question' => 'Most likely to write a famous Netflix series', 'emoji' => '🎬'],
            ['question' => 'Best smile', 'emoji' => '😁'],
            ['question' => 'Most likely to be a CEO', 'emoji' => '💼'],
            ['question' => 'Best dressed', 'emoji' => '👗'],
            ['question' => 'Funniest person', 'emoji' => '😂'],
            ['question' => 'Most athletic', 'emoji' => '🏅'],
            ['question' => 'Best hair', 'emoji' => '💇'],
            ['question' => 'Most creative', 'emoji' => '🎨'],
            ['question' => 'Best dancer', 'emoji' => '🕺'],
            ['question' => 'Most likely to become famous', 'emoji' => '🌟'],
            ['question' => 'Best personality', 'emoji' => '😊'],
            ['question' => 'Most trustworthy', 'emoji' => '🤝'],
            ['question' => 'Best friend material', 'emoji' => '❤️'],
            ['question' => 'Most likely to brighten your day', 'emoji' => '☀️'],
        ];

        foreach ($rooms as $schoolName => $room) {
            $creator = $users[array_rand($users)];
            $poll = Poll::create([
                'room_id' => $room->id,
                'status' => 'active',
            ]);

            foreach ($pollQuestions as $pollData) {
                $schoolUsers = array_filter($users, fn($u) => $u->school === $schoolName);
                $shuffled = collect($schoolUsers)->shuffle()->take(4)->pluck('name')->toArray();

                if (count($shuffled) >= 2) {
                    $question = Question::create([
                        'poll_id' => $poll->id,
                        'question' => $pollData['question'],
                        'emoji' => $pollData['emoji'] ?? null,
                        'options' => $shuffled,
                        'creator_id' => $creator->id,
                        'target_school' => $schoolName,
                        'active' => true,
                    ]);

                    $votersCount = rand(5, 20);
                    for ($i = 0; $i < $votersCount; $i++) {
                        $voter = $users[array_rand($users)];
                        $selectedOption = $shuffled[array_rand($shuffled)];

                        if (!QuestionVote::where('question_id', $question->id)->where('user_id', $voter->id)->exists()) {
                            QuestionVote::create([
                                'question_id' => $question->id,
                                'user_id' => $voter->id,
                                'selected_option' => $selectedOption,
                            ]);
                        }
                    }
                }
            }
        }

        // Anonymous messages
        $anonymousMessages = [
            'i don\'t think u ever knew how much u meant to me',
            'Dobar',
            'we\'ve been friends for sooo long and i love u sm',
            'sometimes i miss those random 3am convos',
            'u cross my mind at the most random times',
            'you\'re literally the best person ever',
            'your energy is unmatched',
            'you make everyone around you happy',
            'i wish we talked more',
            'you\'re so underrated',
        ];

        foreach ($users as $user) {
            $inbox = $user->anonymousInbox;
            if ($inbox) {
                $messageCount = rand(2, 8);
                for ($i = 0; $i < $messageCount; $i++) {
                    AnonymousMessage::create([
                        'inbox_id' => $inbox->id,
                        'message' => $anonymousMessages[array_rand($anonymousMessages)],
                        'metadata' => json_encode(['gender' => rand(0, 1) ? 'boy' : 'girl']),
                    ]);
                }
            }
        }
    }
}
