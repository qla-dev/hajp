<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\ProfileView;
use App\Models\User;

class UserController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate(
            [
                'name' => 'sometimes|string|max:255',
                'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($user->id)],
                'username' => ['sometimes', 'string', 'max:50', Rule::unique('users', 'username')->ignore($user->id)],
                'sex' => 'sometimes|nullable|string|max:10',
                'profile_photo' => 'sometimes|nullable|url',
            ],
            [
                'name.max' => 'Ime može imati najviše 255 karaktera.',
                'email.email' => 'Unesi ispravan email.',
                'email.unique' => 'Email je već iskorišten.',
                'username.unique' => 'Korisničko ime je zauzeto.',
                'username.max' => 'Korisničko ime može imati najviše 50 karaktera.',
                'sex.max' => 'Pol može imati najviše 10 karaktera.',
                'profile_photo.url' => 'Link za profilnu sliku nije ispravan.',
            ]
        );

        $user->fill($data);
        if ($request->has('is_private')) {
            $user->is_private = $request->boolean('is_private');
        }
        $user->save();

        return response()->json($user);
    }

    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:3072', // 3 MB
        ]);

        $user = $request->user();
        $file = $request->file('photo');
        $publicDir = public_path('assets/images/avatar');

        File::ensureDirectoryExists($publicDir);

        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $filename = uniqid('avatar_') . '.' . $extension;

        // Save directly to public/assets/images/avatar
        $file->move($publicDir, $filename);

        $relativePath = '/assets/images/avatar/' . $filename;

        $user->profile_photo = $relativePath;
        $user->save();

        return response()->json(['user' => $user, 'message' => 'Profilna slika je ažurirana.']);
    }

    public function removePhoto(Request $request)
    {
        $user = $request->user();
        $user->profile_photo = null;
        $user->save();

        return response()->json(['user' => $user, 'message' => 'Profilna slika je uklonjena.']);
    }

    public function friendSuggestions(Request $request)
    {
        $user = $request->user();

        $suggestions = User::query()
            ->where('id', '!=', $user->id)
            ->inRandomOrder()
            ->limit(12)
            ->get(['id', 'name', 'username', 'profile_photo', 'sex']);

        return response()->json(['data' => $suggestions]);
    }

    public function friends(Request $request)
    {
        $userId = $request->user()->id;

        $friends = DB::table('friendships')
            ->join('users as u1', function ($join) use ($userId) {
                $join->on('friendships.auth_user_id', '=', 'u1.id');
            })
            ->join('users as u2', function ($join) use ($userId) {
                $join->on('friendships.user_id', '=', 'u2.id');
            })
        ->where(function ($query) use ($userId) {
            $query->where('friendships.auth_user_id', $userId)->orWhere('friendships.user_id', $userId);
        })
        ->where('friendships.approved', 1)
        ->selectRaw(
            'friendships.id,
            CASE WHEN friendships.auth_user_id = ? THEN u2.id ELSE u1.id END as friend_id,
            CASE WHEN friendships.auth_user_id = ? THEN u2.name ELSE u1.name END as name,
            CASE WHEN friendships.auth_user_id = ? THEN u2.username ELSE u1.username END as username,
            CASE WHEN friendships.auth_user_id = ? THEN u2.profile_photo ELSE u1.profile_photo END as profile_photo,
            friendships.created_at',
                [$userId, $userId, $userId, $userId]
            )
            ->orderByDesc('friendships.created_at')
            ->limit(50)
            ->get();

        return response()->json(['data' => $friends]);
    }

    public function friendRequests(Request $request)
    {
        $userId = $request->user()->id;

        $requests = DB::table('friendships')
            ->join('users as u1', function ($join) use ($userId) {
                $join->on('friendships.auth_user_id', '=', 'u1.id');
            })
            ->join('users as u2', function ($join) use ($userId) {
                $join->on('friendships.user_id', '=', 'u2.id');
            })
            ->where('friendships.auth_user_id', $userId)
            ->where('friendships.approved', 0)
            ->selectRaw(
                'friendships.id,
                CASE WHEN friendships.auth_user_id = ? THEN u2.id ELSE u1.id END as friend_id,
                CASE WHEN friendships.auth_user_id = ? THEN u2.name ELSE u1.name END as name,
                CASE WHEN friendships.auth_user_id = ? THEN u2.username ELSE u1.username END as username,
                CASE WHEN friendships.auth_user_id = ? THEN u2.profile_photo ELSE u1.profile_photo END as profile_photo,
                friendships.created_at',
                [$userId, $userId, $userId, $userId]
            )
            ->orderByDesc('friendships.created_at')
            ->get();

        return response()->json(['data' => $requests]);
    }

    public function showPublic(User $user)
    {
        return response()->json([
            'data' => [
                'id' => $user->id,
        'name' => $user->name,
        'username' => $user->username,
        'profile_photo' => $user->profile_photo,
        'sex' => $user->sex,
        'coins' => $user->coins ?? 0,
        'is_private' => $user->is_private ?? 0,
            ],
        ]);
    }

    public function profileViews(User $user)
    {
        $roomMemberships = DB::table('room_members')
            ->selectRaw('user_id, MIN(room_id) as room_id')
            ->groupBy('user_id');

        $views = DB::table('profile_views')
            ->join('users as visitors', 'profile_views.visitor_id', '=', 'visitors.id')
            ->leftJoinSub($roomMemberships, 'rm', function ($join) {
                $join->on('rm.user_id', '=', 'visitors.id');
            })
            ->leftJoin('rooms', 'rooms.id', '=', 'rm.room_id')
            ->where('profile_views.auth_user_id', $user->id)
            ->orderByDesc('profile_views.updated_at')
            ->limit(100)
            ->selectRaw(
                'visitors.id as visitor_id,
                visitors.name,
                visitors.username,
                visitors.profile_photo,
                visitors.sex,
                profile_views.updated_at as viewed_at,
                rooms.name as room_name'
            )
            ->get();

        return response()->json(['data' => $views]);
    }

    public function recordProfileView(Request $request, User $user)
    {
        $visitor = $request->user();

        if (!$visitor || $visitor->id === $user->id) {
            return response()->json(['message' => 'No view recorded.'], 200);
        }

        ProfileView::updateOrCreate(
            [
                'auth_user_id' => $user->id,
                'visitor_id' => $visitor->id,
            ],
            []
        );

        return response()->json(['message' => 'Profile view recorded.'], 201);
    }

    public function roomsForUser(User $user)
    {
        $roomsQuery = $user
            ->rooms()
            ->select('rooms.id', 'rooms.name')
            ->orderByDesc('room_members.created_at');

        $total = (clone $roomsQuery)->count();
        $roomNames = (clone $roomsQuery)->limit(3)->pluck('name')->values();

        return response()->json([
            'total' => $total,
            'rooms' => $roomNames,
        ]);
    }

    public function friendsCount(User $user)
    {
        $count = DB::table('friendships')
            ->where(function ($query) use ($user) {
                $query->where('auth_user_id', $user->id)->orWhere('user_id', $user->id);
            })
            ->where('approved', 1)
            ->count();

        return response()->json(['count' => $count]);
    }

    public function friendshipStatus(Request $request, User $user)
    {
        $authId = $request->user()->id;
        $otherId = $user->id;

        $friendship = DB::table('friendships')
            ->where(function ($query) use ($authId, $otherId) {
                $query->where('auth_user_id', $authId)->where('user_id', $otherId);
            })
            ->orWhere(function ($query) use ($authId, $otherId) {
                $query->where('auth_user_id', $otherId)->where('user_id', $authId);
            })
            ->first();

        if (!$friendship) {
            return response()->json([
                'exists' => false,
                'approved' => null,
            ]);
        }

        return response()->json([
            'exists' => true,
            'approved' => (int) ($friendship->approved ?? 1),
        ]);
    }

    public function addFriend(Request $request, User $user)
    {
        $authUser = $request->user();

        Log::info('AddFriend called', [
            'auth_id' => $authUser?->id,
            'target_id' => $user?->id,
            'ip' => $request->ip(),
            'payload' => $request->all(),
        ]);

        if ($authUser->id === $user->id) {
            Log::warning('AddFriend: user tried to add self', [
                'auth_id' => $authUser->id,
            ]);
            return response()->json(['message' => 'Ne možeš dodati sebe kao prijatelja.'], 422);
        }

        $authId = $authUser->id;
        $otherId = $user->id;

        $low = min($authId, $otherId);
        $high = max($authId, $otherId);

        $existing = DB::table('friendships')
            ->where('auth_user_id', $low)
            ->where('user_id', $high)
            ->first();

        if ($existing) {
            Log::info('AddFriend: friendship already exists', [
                'auth_id' => $authId,
                'other_id' => $otherId,
                'friendship_id' => $existing->id ?? null,
            ]);
            return response()->json(['message' => 'Već ste prijatelji.'], 200);
        }

        $approved = (int) $request->attributes->get('friendship_approved', 1);

        try {
            DB::table('friendships')->insert([
                'auth_user_id' => $low,
                'user_id' => $high,
                'approved' => $approved,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Log::info('AddFriend: friendship created', [
                'auth_id' => $authId,
                'other_id' => $otherId,
                'approved' => $approved,
            ]);

            return response()->json([
                'message' => $approved ? 'Prijatelj dodan.' : 'Zahtjev za prijateljstvo poslan.',
                'approved' => $approved,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('AddFriend: failed to create friendship', [
                'auth_id' => $authId,
                'other_id' => $otherId,
                'approved' => $approved,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Greška pri dodavanju prijatelja.',
            ], 500);
        }
    }

    public function approveFriend(Request $request, User $user)
    {
        $authUser = $request->user();

        $updated = DB::table('friendships')
            ->where('auth_user_id', $authUser->id)
            ->where('user_id', $user->id)
            ->where('approved', 0)
            ->update([
                'approved' => 1,
                'updated_at' => now(),
            ]);

        if (!$updated) {
            return response()->json(['message' => 'Zahtjev nije pronađen.'], 404);
        }

        return response()->json(['message' => 'Zahtjev prihvaćen.', 'approved' => 1]);
    }

    public function removeFriend(Request $request, User $user)
    {
        $authUser = $request->user();

        if ($authUser->id === $user->id) {
            return response()->json(['message' => 'Ne možeš ukloniti sebe.'], 422);
        }

        $authId = $authUser->id;
        $otherId = $user->id;

        $low = min($authId, $otherId);
        $high = max($authId, $otherId);

        DB::table('friendships')
            ->where('auth_user_id', $low)
            ->where('user_id', $high)
            ->delete();

        return response()->json(['message' => 'Prijatelj uklonjen.'], 200);
    }
}
