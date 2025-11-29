<?php

namespace App\Http\Controllers;

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
        $question = $poll->questions()->where('active', true)->first();
        if (!$question) {
            return response()->json(['message' => 'Nema aktivnih pitanja'], 404);
        }
        $question->load('votes');
        return $question;
    }
}
