<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\QuestionVote;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuestionController extends Controller
{
    public function index()
    {
        return Question::where('active', true)->latest()->get();
    }

    public function show(Question $question)
    {
        $question->load('votes');
        return $question;
    }

    public function refreshOptions(Question $question)
    {
        $names = User::inRandomOrder()->limit(4)->pluck('name')->toArray();
        if (count($names) < 2) {
            return response()->json(['message' => 'Nema dovoljno korisnika za osvježenje opcija'], 422);
        }
        $question->options = $names;
        $question->save();

        return $question->fresh();
    }

    public function vote(Request $request, Question $question)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$question->active) {
            return response()->json(['message' => 'Pitanje je zatvoreno'], 422);
        }

        $data = $request->validate([
            'selected_option' => 'required|string',
        ]);

        if (!in_array($data['selected_option'], $question->options, true)) {
            return response()->json(['message' => 'Odabir je neispravan'], 422);
        }

        $existing = QuestionVote::where('question_id', $question->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json($existing, 200);
        }

        $vote = QuestionVote::create([
            'question_id' => $question->id,
            'user_id' => $user->id,
            'selected_option' => $data['selected_option'],
        ]);

        $totals = QuestionVote::select('selected_option', DB::raw('count(*) as votes'))
            ->where('question_id', $question->id)
            ->groupBy('selected_option')
            ->get();

        return response()->json([
            'vote' => $vote,
            'totals' => $totals,
        ], 201);
    }
}
