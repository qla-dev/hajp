<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class QuestionController extends Controller
{
    public function index()
    {
        return Question::with('votes.selectedUser')->latest()->get()->map(function (Question $question) {
            $question->setAttribute('options', $this->generateOptions($question));
            return $question;
        });
    }

    public function show(Question $question)
    {
        $question->load('votes.selectedUser');
        $question->setAttribute('options', $this->generateOptions($question));

        return $question;
    }

    public function refreshOptions(Question $question)
    {
        $question->setAttribute('options', $this->generateOptions($question));

        return $question;
    }

    public function vote(Request $request, Question $question)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $data = $request->validate([
            'selected_option' => 'required|exists:users,id',
        ]);

        $existing = Vote::where('question_id', $question->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json($existing, 200);
        }

        $vote = Vote::create([
            'question_id' => $question->id,
            'user_id' => $user->id,
            'selected_user_id' => $data['selected_option'],
        ]);

        $totals = Vote::select('selected_user_id', DB::raw('count(*) as votes'))
            ->where('question_id', $question->id)
            ->groupBy('selected_user_id')
            ->with('selectedUser:id,name')
            ->get()
            ->map(fn($row) => [
                'selected_user_id' => $row->selected_user_id,
                'selected_user_name' => $row->selectedUser?->name,
                'votes' => $row->votes,
            ]);

        return response()->json([
            'vote' => $vote,
            'totals' => $totals,
        ], 201);
    }

    public function skip(Request $request, Question $question)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $cacheKey = "skipped_questions_user_{$user->id}";
        $skipped = Cache::get($cacheKey, []);
        $skipped[] = $question->id;
        Cache::put($cacheKey, array_values(array_unique($skipped)), now()->addDay());

        return response()->json(['message' => 'Skipped']);
    }

    private function generateOptions(Question $question): array
    {
        $options = $question->generateOptions();

        if (count($options) < 2) {
            throw ValidationException::withMessages([
                'options' => 'Not enough users to generate options',
            ]);
        }

        return $options;
    }
}
