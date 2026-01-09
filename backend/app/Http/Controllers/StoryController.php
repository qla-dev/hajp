<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\Story;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class StoryController extends Controller
{
    public function index(Request $request, User $user)
    {
        $viewer = $request->user();
        $canView = $this->canViewStories($user, $viewer);

        if (!$canView) {
            return response()->json([
                'data' => [],
                'count' => 0,
                'can_view' => false,
            ]);
        }

        $stories = $this->fetchStories($user);

        return response()->json([
            'data' => $stories,
            'count' => $stories->count(),
            'can_view' => true,
        ]);
    }

    public function mine(Request $request)
    {
        $stories = $this->fetchStories($request->user());

        return response()->json([
            'data' => $stories,
            'count' => $stories->count(),
            'can_view' => true,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'media_url' => 'sometimes|string',
            'media' => 'sometimes|file|max:5120',
            'media_type' => 'sometimes|string|in:image,video',
            'caption' => 'sometimes|nullable|string|max:1000',
            'expires_at' => 'sometimes|date',
        ]);

        $mediaUrl = $data['media_url'] ?? null;
        $mediaType = $data['media_type'] ?? null;

        if ($request->hasFile('media')) {
            $file = $request->file('media');
            $storagePath = public_path('assets/stories');
            File::ensureDirectoryExists($storagePath);

            $extension = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg');
            $filename = uniqid('story_') . '.' . $extension;
            $file->move($storagePath, $filename);

            $mediaUrl = "/assets/stories/{$filename}";
            $mediaType = $mediaType ?: (str_starts_with($file->getMimeType(), 'video/') ? 'video' : 'image');
        }

        if (!$mediaUrl) {
            return response()->json(['message' => 'Media is required'], 422);
        }

        $story = Story::create([
            'user_id' => $user->id,
            'media_url' => $mediaUrl,
            'media_type' => $mediaType ?: 'image',
            'caption' => $data['caption'] ?? null,
            'expires_at' => $data['expires_at'] ?? now()->addHours(24),
            'is_active' => 1,
        ]);

        return response()->json(['data' => $story], 201);
    }

    private function fetchStories(User $user)
    {
        return $user->activeStories()
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Story $story) {
                return [
                    'id' => $story->id,
                    'media_url' => $story->media_url,
                    'media_type' => $story->media_type,
                    'caption' => $story->caption,
                    'is_active' => (bool) $story->is_active,
                    'expires_at' => $story->expires_at?->toIso8601String(),
                    'created_at' => $story->created_at?->toIso8601String(),
                ];
            });
    }

    private function canViewStories(User $owner, ?User $viewer): bool
    {
        if (!$viewer) {
            return !($owner->is_private ?? false);
        }

        if ($viewer->id === $owner->id) {
            return true;
        }

        if (!($owner->is_private ?? false)) {
            return true;
        }

        $friendship = Friendship::query()
            ->where(function ($query) use ($viewer, $owner) {
                $query->where('auth_user_id', $viewer->id)->where('user_id', $owner->id);
            })
            ->orWhere(function ($query) use ($viewer, $owner) {
                $query->where('auth_user_id', $owner->id)->where('user_id', $viewer->id);
            })
            ->where('approved', 1)
            ->first();

        return (bool) $friendship;
    }
}
