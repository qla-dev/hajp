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

        $questionIds = $poll->questions()->where('active', true)->orderBy('id')->pluck('id');
        if ($questionIds->isEmpty()) {
            return response()->json(['message' => 'Nema aktivnih pitanja'], 404);
        }

        $questionId = $questionIds->first();
        $question = Question::with('votes')->find($questionId);
        $index = $questionIds->search($questionId);
        $index = ($index === false ? 1 : $index + 1);

        return response()->json([
            'question' => $question,
            'total' => $questionIds->count(),
            'index' => $index,
            'poll_id' => $poll->id,
        ]);
    }
}
