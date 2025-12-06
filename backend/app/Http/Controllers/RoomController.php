<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

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
        ]);
    }

    public function userRooms(Request $request)
    {
        $roomsQuery = $request->user()
            ->rooms()
            ->select('rooms.id', 'rooms.name')
            ->orderByDesc('room_members.created_at');

        $total = (clone $roomsQuery)->count();
        $roomNames = (clone $roomsQuery)->limit(3)->pluck('name')->values();

        return response()->json([
            'total' => $total,
            'rooms' => $roomNames,
        ]);
    }

    public function activeQuestion(Request $request, Room $room)
    {
        $user = $request->user();
        $poll = $room->polls()->where('status', 'active')->latest()->first();
        if (!$poll) {
            return response()->json(['message' => 'Nema aktivnih anketa'], 404);
        }

        $questionsQuery = $poll->questions()->with('votes.selectedUser')->orderBy('id');

        if ($user) {
            $skipped = Cache::get("skipped_questions_user_{$user->id}", []);
            $questionsQuery->whereDoesntHave('votes', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });

            if (!empty($skipped)) {
                $questionsQuery->whereNotIn('id', $skipped);
            }
        }

        $total = $poll->questions()->count();
        if ($total === 0) {
            return response()->json(['message' => 'Nema aktivnih pitanja'], 404);
        }

        $question = $questionsQuery->first();
        if (!$question) {
            return response()->json(['message' => 'Nema aktivnih pitanja'], 404);
        }

        $options = $question->generateOptions();
        if (count($options) < 2) {
            return response()->json(['message' => 'Nema dovoljno korisnika za opcije'], 422);
        }

        $question->setAttribute('options', $options);

        $answeredCount = 0;
        $skippedCount = 0;
        if ($user) {
            $answeredCount = $poll->questions()
                ->whereHas('votes', fn($q) => $q->where('user_id', $user->id))
                ->count();
            $skippedCount = count(Cache::get("skipped_questions_user_{$user->id}", []));
        }
        $index = $user ? min($total, $answeredCount + $skippedCount + 1) : 1;

        return response()->json([
            'question' => $question,
            'total' => $total,
            'index' => $index,
            'poll_id' => $poll->id,
        ]);
    }
}
