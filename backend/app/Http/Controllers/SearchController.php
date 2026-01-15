<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query = trim((string) $request->query('query', ''));
        if ($query === '') {
            return response()->json(['data' => []]);
        }

        $limit = (int) $request->query('limit', 20);
        $limit = max(5, min($limit, 60));

        $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $query);
        $like = "%{$escaped}%";
        $userId = $request->user()->id;

        $users = User::query()
            ->where('id', '!=', $userId)
            ->where(function ($q) use ($like) {
                $q->where('name', 'LIKE', $like)->orWhere('username', 'LIKE', $like);
            })
            ->select('id', 'name', 'username', 'profile_photo', 'avatar', 'note', 'updated_at')
            ->orderByDesc('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn ($user) => [
                'type' => 'user',
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'profile_photo' => $user->profile_photo,
                'avatar' => $user->avatar,
                'description' => $user->note,
                'timestamp' => $user->updated_at?->toIso8601String(),
            ]);

        $groups = Room::query()
            ->where('name', 'LIKE', $like)
            ->select('id', 'name', 'description', 'tagline', 'cover_url', 'type', 'updated_at')
            ->orderByDesc('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn ($room) => [
                'type' => 'group',
                'id' => $room->id,
                'name' => $room->name,
                'subtitle' => $room->tagline ?? 'Grupa',
                'description' => $room->description,
                'cover_url' => $room->cover_url,
                'group_type' => $room->type,
                'timestamp' => $room->updated_at?->toIso8601String(),
            ]);

        $combined = $users
            ->concat($groups)
            ->sortByDesc(fn ($entry) => $entry['timestamp'] ?? '')
            ->values()
            ->take($limit);

        return response()->json(['data' => $combined->values()]);
    }
}
