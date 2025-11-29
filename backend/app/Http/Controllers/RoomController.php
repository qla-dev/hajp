<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Room;

class RoomController extends Controller
{
    public function index()
    {
        return Room::select('id', 'name', 'type', 'is_18_over')->get();
    }

    public function activeQuestion(Room $room)
    {
        $poll = $room->polls()->where('status', 'active')->latest()->first();
        if (!$poll) {
            return response()->json(['message' => 'Nema aktivnih anketa'], 404);
        }

        $total = $poll->questions()->count();
        if ($total === 0) {
            return response()->json(['message' => 'Nema aktivnih pitanja'], 404);
        }

        $activeIds = $poll->questions()->where('active', true)->orderBy('id')->pluck('id');
        if ($activeIds->isEmpty()) {
            return response()->json(['message' => 'Nema aktivnih pitanja'], 404);
        }

        $questionId = $activeIds->first();
        $question = Question::with('votes')->find($questionId);
        $remainingActive = $activeIds->count();
        $index = max(1, $total - $remainingActive + 1);

        return response()->json([
            'question' => $question,
            'total' => $total,
            'index' => $index,
            'poll_id' => $poll->id,
        ]);
    }
}
