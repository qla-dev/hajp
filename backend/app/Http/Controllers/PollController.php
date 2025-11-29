<?php

namespace App\Http\Controllers;

use App\Models\Poll;
use App\Models\PollVote;
use Illuminate\Http\Request;

class PollController extends Controller
{
    public function index()
    {
        return Poll::where('active', true)->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'question' => 'required|string',
            'options' => 'required|array|min:2|max:5',
            'target_school' => 'required|string',
        ]);

        $poll = Poll::create([
            'question' => $data['question'],
            'options' => $data['options'],
            'creator_id' => $request->user()->id,
            'target_school' => $data['target_school'],
            'active' => true,
        ]);

        return response()->json($poll, 201);
    }

    public function show(Poll $poll)
    {
        $poll->load('votes');
        return $poll;
    }

    public function vote(Request $request, Poll $poll)
    {
        $data = $request->validate([
            'selected_option' => 'required|string',
        ]);
        $vote = PollVote::create([
            'poll_id' => $poll->id,
            'user_id' => $request->user()->id,
            'selected_option' => $data['selected_option'],
        ]);
        return response()->json($vote, 201);
    }
}
