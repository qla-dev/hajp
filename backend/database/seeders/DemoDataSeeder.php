<?php

namespace Database\Seeders;

use App\Models\AnonymousMessage;
use App\Models\Poll;
use App\Models\Question;
use App\Models\Room;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        $password = Hash::make('password123');
        $schools = [
            'Newton North High School',
            'Newton South High School',
            'Brighton High School',
            'Watertown High School',
            'Learning Prep School',
        ];

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

        $userRows = [];
        $demoEmails = [];
        foreach ($firstNames as $index => $firstName) {
            $lastName = $lastNames[$index];
            $email = strtolower($firstName . '.' . $lastName . '@school.com');
            $demoEmails[] = $email;
            $userRows[] = [
                'name' => $firstName . ' ' . $lastName,
                'username' => strtolower($firstName . $lastName . $index),
                'email' => $email,
                'password' => $password,
                'profile_photo' => null,
                'is_subscribed' => $index % 3 === 0,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        User::query()->upsert(
            $userRows,
            ['email'],
            ['name', 'username', 'password', 'profile_photo', 'is_subscribed', 'updated_at']
        );

        $users = User::query()
            ->whereIn('email', $demoEmails)
            ->orderBy('id')
            ->get()
            ->values();

        $subscribedRows = $users
            ->filter(fn (User $user, int $index) => $index % 3 === 0)
            ->map(fn (User $user) => [
                'user_id' => $user->id,
                'expires_at' => $now->copy()->addMonth(),
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->values()
            ->all();

        Subscription::query()->whereIn('user_id', $users->pluck('id'))->delete();
        if ($subscribedRows !== []) {
            Subscription::query()->insert($subscribedRows);
        }

        $covers = [
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80',
        ];
        $taglines = [
            'Grow together, challenge the norms',
            'Late-night debates and unstoppable energy',
            'The place for bold ideas and spicy takes',
            'Curate your vibe, keep the hype alive',
        ];
        $descriptions = [
            'Shared playlists, trending polls, and friends who get the vibe.',
            'Fresh prompts, wild opinions, and a community that keeps it real.',
            'Meet the crew tossing out rapid-fire debates and winning mood checks.',
            'Drop in for micro podcasts, snappy polls, and zero drama.',
        ];

        $roomRows = [];
        foreach ($schools as $index => $roomName) {
            $roomRows[] = [
                'name' => $roomName,
                'type' => 'public',
                'is_18_over' => false,
                'cover_url' => $covers[$index % count($covers)],
                'tagline' => $taglines[$index % count($taglines)],
                'description' => $descriptions[$index % count($descriptions)],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        foreach ($roomRows as $roomRow) {
            Room::query()->updateOrCreate(
                ['name' => $roomRow['name']],
                [
                    'type' => $roomRow['type'],
                    'is_18_over' => $roomRow['is_18_over'],
                    'cover_url' => $roomRow['cover_url'],
                    'tagline' => $roomRow['tagline'],
                    'description' => $roomRow['description'],
                ]
            );
        }

        $rooms = Room::query()
            ->whereIn('name', $schools)
            ->orderBy('id')
            ->get()
            ->values();

        DB::table('room_members')
            ->whereIn('user_id', $users->pluck('id'))
            ->whereIn('room_id', $rooms->pluck('id'))
            ->delete();

        $memberRows = [];
        foreach ($users as $index => $user) {
            $memberRows[] = [
                'user_id' => $user->id,
                'room_id' => $rooms[$index % $rooms->count()]->id,
                'role' => 'user',
                'approved' => true,
                'accepted' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        DB::table('room_members')->insert($memberRows);

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

        $demoVibes = json_encode(['public']);
        $demoPollIds = Poll::query()->where('vibes', $demoVibes)->pluck('id');
        $demoQuestionIds = Question::query()->whereIn('poll_id', $demoPollIds)->pluck('id');
        Vote::query()->whereIn('question_id', $demoQuestionIds)->delete();
        Question::query()->whereIn('poll_id', $demoPollIds)->delete();
        Poll::query()->whereIn('id', $demoPollIds)->delete();

        $poll = Poll::query()->create([
            'vibes' => $demoVibes,
            'status' => 'active',
        ]);

        $creator = $users->first();
        $questionRows = array_map(fn (array $pollData) => [
            'poll_id' => $poll->id,
            'question' => $pollData['question'],
            'emoji' => $pollData['emoji'] ?? null,
            'creator_id' => $creator->id,
            'created_at' => $now,
            'updated_at' => $now,
        ], $pollQuestions);
        Question::query()->insert($questionRows);

        $questions = Question::query()
            ->where('poll_id', $poll->id)
            ->orderBy('id')
            ->get()
            ->values();

        $userIds = $users->pluck('id')->values()->all();
        $usersByRoom = [];
        foreach ($rooms as $room) {
            $usersByRoom[$room->id] = DB::table('room_members')
                ->where('room_id', $room->id)
                ->pluck('user_id')
                ->values()
                ->all();
        }

        $voteRows = [];
        foreach ($questions as $questionIndex => $question) {
            $room = $rooms[$questionIndex % $rooms->count()];
            $optionPool = $usersByRoom[$room->id] ?: $userIds;
            $voterCount = min(16, count($userIds));
            for ($i = 0; $i < $voterCount; $i++) {
                $voteRows[] = [
                    'question_id' => $question->id,
                    'room_id' => $room->id,
                    'user_id' => $userIds[($questionIndex + $i) % count($userIds)],
                    'selected_user_id' => $optionPool[$i % count($optionPool)],
                    'seen' => 0,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }
        Vote::query()->insert($voteRows);

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

        AnonymousMessage::query()->whereIn('user_id', $userIds)->delete();
        $messageRows = [];
        foreach ($users as $userIndex => $user) {
            for ($i = 0; $i < 4; $i++) {
                $messageRows[] = [
                    'user_id' => $user->id,
                    'message' => $anonymousMessages[($userIndex + $i) % count($anonymousMessages)],
                    'style_id' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }
        AnonymousMessage::query()->insert($messageRows);
    }
}
