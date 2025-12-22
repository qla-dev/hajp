<?php

namespace App\Http\Controllers;

use App\Models\CashoutHistory;
use App\Models\Question;
use App\Models\Room;
use App\Models\RoomMember;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RoomController extends Controller
{
    public function index()
    {
        return Room::withCount(['users as members_count'])->get([
            'id',
            'name',
            'type',
            'is_18_over',
            'cover_url',
            'tagline',
            'description',
            'is_private',
            'code',
        ]);
    }

    public function join(Request $request, Room $room, string $role = 'user')
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $approved = $room->is_private ? 0 : 1;
        RoomMember::updateOrCreate(
            ['room_id' => $room->id, 'user_id' => $user->id],
            ['approved' => $approved, 'role' => $role]
        );

        return response()->json([
            'status' => $approved ? 'joined' : 'requested',
            'room_id' => $room->id,
            'room_name' => $room->name,
            'message' => "Uspješno si se pridružio sobi: {$room->name}",
        ]);
    }

    public function joinByCode(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string',
        ]);

        $room = Room::where('code', $data['code'])->first();
        if (!$room) {
            return response()->json(['message' => 'Uneseni kod ne pripada ni jednoj sobi. Pokušaj ponovo'], 404);
        }

        return $this->join($request, $room);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        Log::info('Room creation attempt', [
            'user_id' => $user->id,
            'payload' => $request->except(['cover']),
        ]);

        try {
            $data = $request->validate([
                'name' => 'required|string|max:100',
                'type' => 'sometimes|string',
                'is_private' => 'sometimes|boolean',
                'is_18_over' => 'sometimes|boolean',
                'tagline' => 'sometimes|nullable|string',
                'description' => 'sometimes|nullable|string',
                'cover_url' => 'sometimes|nullable|url',
                'cover' => 'sometimes|image|max:5120',
            ]);
        } catch (ValidationException $exception) {
            Log::warning('Room creation validation failed', [
                'user_id' => $user->id,
                'errors' => $exception->errors(),
                'payload' => $request->except(['cover']),
            ]);
            throw $exception;
        }

        $payload = [
            'name' => $data['name'],
            'type' => $data['type'] ?? 'public',
            'is_private' => $data['is_private'] ?? false,
            'is_18_over' => $data['is_18_over'] ?? false,
            'tagline' => $data['tagline'] ?? null,
            'description' => $data['description'] ?? null,
            'cover_url' => $data['cover_url'] ?? null,
            'code' => $data['code'] ?? $this->generateRoomCode(),
        ];

        if ($request->hasFile('cover')) {
            $payload['cover_url'] = $this->saveCoverFile($request->file('cover'));
        }

        $room = Room::create($payload);

        Log::info('Room created', [
            'room_id' => $room->id,
            'user_id' => $user->id,
        ]);

        $this->join($request, $room, 'admin');

        return response()->json(['data' => $room], 201);
    }
    
    public function leave(Request $request, Room $room)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $membership = RoomMember::where('room_id', $room->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$membership) {
            return response()->json(['message' => 'Nisi član ove sobe'], 403);
        }

        $wasAdmin = $membership->role === 'admin';

        return DB::transaction(function () use ($membership, $room, $user, $wasAdmin) {
            $membership->delete();

            if ($wasAdmin) {
                $newAdmin = RoomMember::where('room_id', $room->id)
                    ->where('user_id', '!=', $user->id)
                    ->orderBy('id')
                    ->first();
                if ($newAdmin) {
                    $newAdmin->role = 'admin';
                    $newAdmin->save();
                }
            }

            return response()->json(['status' => 'left']);
        });
    }

    public function uploadCover(Request $request, Room $room)
    {
        $user = $request->user();
        if (!$user || !$user->rooms()->where('rooms.id', $room->id)->exists()) {
            return response()->json(['message' => 'Nedostatak ovlašćenja'], 403);
        }

        $request->validate([
            'cover' => 'required|image|max:5120',
        ]);

        $coverPath = $this->saveCoverFile($request->file('cover'));
        $room->cover_url = $coverPath;
        $room->save();

        Log::info('Room cover updated', [
            'room_id' => $room->id,
            'user_id' => $user->id,
            'cover_url' => $coverPath,
        ]);

        return response()->json(['data' => $room]);
    }

    public function userRooms(Request $request, $userId, string $role = 'user')
    {
        $user = $request->user();
        $role = strtolower($role ?? 'user');
        $rooms = Room::withCount(['users as members_count'])
            ->whereHas('members', function ($query) use ($user, $role) {
                $query->where('user_id', $user->id);
                if ($role === 'admin') {
                    $query->where('role', 'admin');
                }
            })
            ->with([
                'members' => function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                },
            ])
            ->get([
                'id',
                'name',
                'type',
                'is_18_over',
                'cover_url',
                'tagline',
                'description',
                'is_private',
                'code',
            ]);

        $rooms = $rooms->map(function ($room) {
            $room->role = $room->members->first()?->role ?? 'user';
            $room->setRelation('members', null);
            return $room;
        });

        return response()->json([
            'total' => $rooms->count(),
            'rooms' => $rooms,
        ]);
    }

    public function status(Request $request)
    {
        $rooms = Room::withCount(['users as members_count'])->get([
            'id',
            'name',
            'type',
            'is_18_over',
            'cover_url',
            'tagline',
            'description',
            'is_private',
        ]);

        $user = $request->user();
        $payload = $rooms->map(function ($room) use ($user) {
            $highlight = null;
            $result = $this->buildActiveQuestionData($room, $user);
            if (!isset($result['error'])) {
                $highlight = [
                    'question' => $result['question']->question,
                    'emoji' => $result['question']->emoji,
                    'total' => $result['total'],
                    'answered' => $result['answered'],
                ];
            }

            $roomData = $room->toArray();
            $roomData['active_question'] = $highlight;
            return $roomData;
        });

        return response()->json(['data' => $payload]);
    }

    public function cashoutStatus(Request $request, Room $room)
    {
        $poll = $room->polls()->latest('created_at')->first();
        if (!$poll) {
            return response()->json(['message' => 'Nema prethodnih anketa'], 404);
        }

        $user = $request->user();
        $nextPollAt = ($poll->updated_at ?? $poll->created_at ?? Carbon::now())->copy()->addHours(4);
        $hasCashout = false;
        if ($user) {
            $hasCashout = CashoutHistory::where('user_id', $user->id)
                ->where('poll_id', $poll->id)
                ->exists();
        }

        return response()->json([
            'poll_id' => $poll->id,
            'last_poll_at' => ($poll->updated_at ?? $poll->created_at)->toIso8601String(),
            'next_poll_at' => $nextPollAt->toIso8601String(),
            'can_cashout' => !$hasCashout,
            'cashout_amount' => 10,
        ]);
    }

    public function cashout(Request $request, Room $room)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $poll = $room->polls()->latest('created_at')->first();
        if (!$poll) {
            return response()->json(['message' => 'Nema anketa za isplatu'], 404);
        }

        $existing = CashoutHistory::where('user_id', $user->id)
            ->where('poll_id', $poll->id)
            ->exists();
        if ($existing) {
            return response()->json(['message' => 'Već si podigao ovu isplatu'], 422);
        }

        /** @var CashoutHistory|null $history */
        $history = null;
        DB::transaction(function () use ($user, $poll, &$history) {
            $history = CashoutHistory::create([
                'user_id' => $user->id,
                'poll_id' => $poll->id,
            ]);
            $user->increment('hajp_coins', 10);
        });

        $user->refresh();
        $nextPollAt = ($poll->updated_at ?? $poll->created_at ?? Carbon::now())->copy()->addHours(4);

        return response()->json([
            'coins' => $user->coins,
            'cashout' => $history,
            'next_poll_at' => $nextPollAt->toIso8601String(),
        ], 201);
    }

    public function rank(Request $request, Room $room, string $period)
    {
        $period = strtolower($period);
        $now = Carbon::now();
        $start = match ($period) {
            'week' => $now->copy()->startOfWeek(),
            'month' => $now->copy()->startOfMonth(),
            default => $now->copy()->startOfDay(),
        };

        $filteredVotes = Vote::query()
            ->where('selected_user_id', '>', 0)
            ->whereBetween('created_at', [$start, $now])
            ->where('room_id', $room->id);

        $rank = (clone $filteredVotes)
            ->select('selected_user_id')
            ->selectRaw('COUNT(*) as hajps')
            ->with('selectedUser:id,name,username,profile_photo')
            ->groupBy('selected_user_id')
            ->orderByDesc('hajps')
            ->limit(25)
            ->get()
            ->map(function ($entry) {
                return [
                    'user_id' => $entry->selected_user_id,
                    'name' => $entry->selectedUser?->name ?? 'Neko',
                    'username' => $entry->selectedUser?->username,
                    'profile_photo' => $entry->selectedUser?->profile_photo,
                    'hajps' => (int) $entry->hajps,
                ];
            });
        return response()->json(['data' => $rank]);
    }

    public function activeQuestion(Request $request, Room $room)
    {
        $result = $this->buildActiveQuestionData($room, $request->user());
        if (isset($result['error'])) {
            return response()->json(['message' => $result['error']], $result['status']);
        }

        return response()->json([
            'question' => $result['question'],
            'total' => $result['total'],
            'index' => $result['index'],
            'poll_id' => $result['poll_id'],
        ]);
    }

    public function bulkActiveQuestions(Request $request)
    {
        $roomIds = (array) $request->input('room_ids', []);
        if (!$roomIds) {
            return response()->json(['data' => []]);
        }

        $rooms = Room::whereIn('id', $roomIds)->get();
        $user = $request->user();
        $data = [];

        foreach ($rooms as $room) {
            $result = $this->buildActiveQuestionData($room, $user);
            if (isset($result['error'])) {
                continue;
            }

            $data[] = [
                'room_id' => $room->id,
                'question' => $result['question']->question,
                'emoji' => $result['question']->emoji,
                'total' => $result['total'],
                'answered' => $result['answered'],
            ];
        }

        return response()->json(['data' => $data]);
    }

    private function buildActiveQuestionData(Room $room, ?User $user)
    {
        $poll = $room->polls()->where('status', 'active')->latest()->first();
        if (!$poll) {
            return ['error' => 'Nema aktivnih anketa', 'status' => 404];
        }

        $questionsQuery = $poll->questions()
            ->with(['votes' => fn($q) => $q->where('room_id', $room->id)->with('selectedUser')])
            ->orderBy('id');
        if ($user) {
            $questionsQuery->whereDoesntHave('votes', function ($q) use ($user, $room) {
                $q->where('user_id', $user->id)->where('room_id', $room->id);
            });
        }

        $total = $poll->questions()->count();
        if ($total === 0) {
            return ['error' => 'Nema aktivnih pitanja', 'status' => 404];
        }

        $question = $questionsQuery->first();
        if (!$question) {
            return ['error' => 'Nema aktivnih pitanja', 'status' => 404];
        }

        $options = $question->generateOptions();
        if (count($options) < 2) {
            return ['error' => 'Nema dovoljno korisnika za opcije', 'status' => 422];
        }

        $question->setAttribute('options', $options);

        $answeredCount = 0;
        if ($user) {
            $answeredCount = $poll->questions()
                ->whereHas('votes', fn($q) => $q->where('user_id', $user->id)->where('room_id', $room->id))
                ->count();
        }
        $index = $user ? min($total, $answeredCount + 1) : 1;
        $answered = max(0, min($total, $answeredCount));

        return [
            'question' => $question,
            'total' => $total,
            'index' => $index,
            'poll_id' => $poll->id,
            'answered' => $answered,
        ];
    }

    private function generateRoomCode(): string
    {
        $lettersCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        do {
            $letters = substr(str_shuffle($lettersCharacters), 0, 3);
            $numbers = str_pad((string) mt_rand(0, 999), 3, '0', STR_PAD_LEFT);
            $code = "{$letters}{$numbers}";
        } while (Room::where('code', $code)->exists());

        return $code;
    }

    private function saveCoverFile(UploadedFile $file): string
    {
        $coverDir = public_path('assets/images/room-covers');
        File::ensureDirectoryExists($coverDir);
        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $filename = uniqid('room_cover_') . '.' . $extension;
        $file->move($coverDir, $filename);
        return '/assets/images/room-covers/' . $filename;
    }
}
