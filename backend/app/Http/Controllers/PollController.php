<?php

namespace App\Http\Controllers;

use App\Models\Poll;
use App\Models\PollVote;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

    public function refreshOptions(Poll $poll)
    {
        // Pull fresh random user names to replace current options
        $names = User::inRandomOrder()
            ->limit(4)
            ->pluck('name')
            ->toArray();

        if (count($names) < 2) {
            return response()->json(['message' => 'Nema dovoljno korisnika za osvježavanje opcija'], 422);
        }

        $poll->options = $names;
        $poll->save();

        return $poll->fresh();
    }

    public function vote(Request $request, Poll $poll)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$poll->active) {
            return response()->json(['message' => 'Poll is closed'], 422);
        }

        $data = $request->validate([
            'selected_option' => 'required|string',
        ]);

        if (!in_array($data['selected_option'], $poll->options, true)) {
            return response()->json(['message' => 'Selected option is invalid'], 422);
        }

        $existing = PollVote::where('poll_id', $poll->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json($existing, 200);
        }

        $vote = PollVote::create([
            'poll_id' => $poll->id,
            'user_id' => $user->id,
            'selected_option' => $data['selected_option'],
        ]);

        $totals = PollVote::select('selected_option', DB::raw('count(*) as votes'))
            ->where('poll_id', $poll->id)
            ->groupBy('selected_option')
            ->get();

        return response()->json([
            'vote' => $vote,
            'totals' => $totals,
        ], 201);
    }
}
