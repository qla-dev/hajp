<?php

namespace App\Http\Controllers;

use App\Models\Poll;
use Illuminate\Http\Request;

class PollController extends Controller
{
    public function index()
    {
        return Poll::with('room')->latest()->get();
    }

    public function show(Poll $poll)
    {
        return $poll->load('room', 'questions');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'status' => 'sometimes|string',
        ]);

        $poll = Poll::create([
            'room_id' => $data['room_id'],
            'status' => $data['status'] ?? 'active',
        ]);

        return response()->json($poll, 201);
    }

    public function update(Request $request, Poll $poll)
    {
        $data = $request->validate([
            'room_id' => 'sometimes|exists:rooms,id',
            'status' => 'sometimes|string',
        ]);

        $poll->update($data);
        return $poll->fresh();
    }

    public function destroy(Poll $poll)
    {
        $poll->delete();
        return response()->json(['deleted' => true]);
    }
}
