<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;

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

        Log::info('Vote attempt', [
            'user_id' => $user->id,
            'question_id' => $question->id,
            'payload' => $request->all(),
        ]);

        $data = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'selected_option' => 'required|exists:users,id',
        ]);

        $roomId = $data['room_id'];
        $existing = Vote::where('question_id', $question->id)
            ->where('room_id', $roomId)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json($existing, 200);
        }

        $vote = Vote::create([
            'question_id' => $question->id,
            'room_id' => $roomId,
            'user_id' => $user->id,
            'selected_user_id' => $data['selected_option'],
        ]);

        $totals = Vote::select('selected_user_id', DB::raw('count(*) as votes'))
            ->where('question_id', $question->id)
            ->where('room_id', $roomId)
            ->where('selected_user_id', '>', 0)
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

        $data = $request->validate([
            'room_id' => 'required|exists:rooms,id',
        ]);
        $roomId = $data['room_id'];
        $existing = Vote::where('question_id', $question->id)
            ->where('room_id', $roomId)
            ->where('user_id', $user->id)
            ->first();
        if ($existing) {
            return response()->json($existing, 200);
        }

        $vote = Vote::create([
            'question_id' => $question->id,
            'room_id' => $roomId,
            'user_id' => $user->id,
            'selected_user_id' => null,
        ]);

        return response()->json(['vote' => $vote], 201);
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

    public function myVotes(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $targetUserId = $request->query('selected_user_id') ?: $user->id;
        $pageParam = $request->query('page');
        $limitParam = $request->query('limit');

        $query = Vote::with(['question', 'user'])
            ->where('selected_user_id', $targetUserId)
            ->orderByDesc('created_at');

        if ($pageParam !== null || $limitParam !== null) {
            $limit = max(1, (int) ($limitParam ?? 10));
            $page = max(1, (int) ($pageParam ?? 1));
            $offset = ($page - 1) * $limit;

            $votes = (clone $query)
                ->skip($offset)
                ->take($limit)
                ->get();

            $total = (clone $query)->count();

            return response()->json([
                'data' => $votes,
                'meta' => [
                    'page' => $page,
                    'limit' => $limit,
                    'has_more' => $offset + $limit < $total,
                ],
            ]);
        }

        return $query->get();
    }

    public function payVote(Request $request, User $user)
    {
        $authUser = $request->user();

        if (!$authUser || $authUser->id !== $user->id) {
            return response()->json(['message' => 'Nemate dozvolu.'], 403);
        }

        $data = $request->validate([
            'vote_id' => 'required|integer',
            'amount' => 'sometimes|integer|min:1',
        ]);

        $amount = (int) ($data['amount'] ?? 50);
        $vote = Vote::query()
            ->where('id', $data['vote_id'])
            ->where('selected_user_id', $user->id)
            ->first();

        if (!$vote) {
            return response()->json(['message' => 'Hajp nije pronadjen.'], 404);
        }

        if ((int) ($vote->seen ?? 0) === 1) {
            return response()->json([
                'message' => 'Hajp je vec otkriven.',
                'coins' => $authUser->coins ?? 0,
                'seen' => 1,
                'vote_id' => (int) $vote->id,
            ]);
        }

        $coins = (int) ($authUser->coins ?? 0);
        if ($coins < $amount) {
            return response()->json(['message' => 'Nemate dovoljno coinova.'], 422);
        }

        $authUser->coins = $coins - $amount;
        $authUser->save();

        $vote->seen = 1;
        $vote->save();

        return response()->json([
            'message' => 'Hajp otkriven.',
            'coins' => $authUser->coins ?? 0,
            'seen' => 1,
            'vote_id' => (int) $vote->id,
        ]);
    }

    public function activities(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $limit = max(1, (int) $request->query('limit', 10));
        $page = max(1, (int) $request->query('page', 1));

        $friendships = DB::table('friendships')
            ->where('approved', 1)
            ->where(function ($query) use ($user) {
                $query->where('auth_user_id', $user->id)->orWhere('user_id', $user->id);
            })
            ->get();

        $friendIds = [];
        foreach ($friendships as $friendship) {
            $friendIds[] = $friendship->auth_user_id === $user->id ? $friendship->user_id : $friendship->auth_user_id;
        }

        if (empty($friendIds)) {
            return response()->json([
                'data' => [],
                'meta' => [
                    'page' => $page,
                    'limit' => $limit,
                    'has_more' => false,
                ],
            ]);
        }

        $offset = ($page - 1) * $limit;

        $activityQuery = Vote::with(['question', 'user', 'selectedUser', 'question.poll.room'])
            ->where(function ($query) use ($friendIds) {
                $query->whereIn('user_id', $friendIds)
                    ->orWhereIn('selected_user_id', $friendIds);
            });

        $votes = (clone $activityQuery)
            ->orderByDesc('created_at')
            ->skip($offset)
            ->take($limit)
            ->get();

        $total = (clone $activityQuery)->count();

        $prepared = $votes->map(function (Vote $vote) use ($friendIds) {
            $isFriendCaster = in_array($vote->user_id, $friendIds, true);
            $isFriendTarget = in_array($vote->selected_user_id, $friendIds, true);

            return [
                ...$vote->toArray(),
            'action' => $isFriendCaster ? 'ishajpao' : 'ishajpan',
                'is_friend_target' => $isFriendTarget,
                'is_friend_caster' => $isFriendCaster,
            ];
        });

        $response = [
            'data' => $prepared,
            'meta' => [
                'page' => $page,
                'limit' => $limit,
                'has_more' => $offset + $limit < $total,
            ],
        ];


        return response()->json($response);
    }
}
