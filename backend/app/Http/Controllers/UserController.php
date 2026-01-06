<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\ProfileView;
use App\Models\User;
use App\Models\Friendship;
use App\Models\RoomMember;

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
                'avatar' => 'sometimes|nullable|string',
                'note' => 'sometimes|nullable|string|max:280',
            ],
            [
                'name.max' => 'Ime može imati najviše 255 karaktera.',
                'email.email' => 'Unesi ispravan email.',
                'email.unique' => 'Email je već iskorišten.',
                'username.unique' => 'Korisničko ime je zauzeto.',
                'username.max' => 'Korisničko ime može imati najviše 50 karaktera.',
                'sex.max' => 'Pol može imati najviše 10 karaktera.',
                'profile_photo.url' => 'Link za profilnu sliku nije ispravan.',
                'avatar.string' => 'Avatar nije ispravan.',
                'note.max' => 'Bilješka može imati najviše 280 karaktera.',
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

    public function coins(Request $request)
    {
        $user = $request->user();
        return response()->json(['coins' => $user->coins ?? 0]);
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

    public function friendsForUser(Request $request, User $user)
    {
        $friends = $this->buildFriendsList($user->id, $request->query('room_id'));
        return response()->json(['data' => $friends]);
    }

    public function friends(Request $request)
    {
        $userId = $request->user()->id;
        $friends = $this->buildFriendsList($userId, $request->query('room_id'));
        return response()->json(['data' => $friends]);
    }

    public function friendRequests(Request $request)
    {
        $userId = $request->user()->id;

        // Pending friendship requests (sent to me)
        $friendRequests = Friendship::query()
            ->where('user_id', $userId)
            ->where('approved', 0)
            ->with(['requester:id,name,username,profile_photo'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($friendship) {
                return (object) [
                    'id' => $friendship->id,
                    'ref_type' => 'friendship',
                    'ref_id' => $friendship->id,
                    'user_id' => $friendship->requester?->id,
                    'name' => $friendship->requester?->name,
                    'username' => $friendship->requester?->username,
                    'profile_photo' => $friendship->requester?->profile_photo,
                    'created_at' => $friendship->created_at,
                ];
            });

        // Invites sent to me to join rooms (I need to accept)
        $roomInvitesForMe = RoomMember::query()
            ->with(['room:id,name,cover_url,type', 'room.vibe:id,slug,icon', 'invitedBy:id,name,username,profile_photo'])
            ->where('user_id', $userId)
            ->where('accepted', 0)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($membership) {
                return (object) [
                    'id' => $membership->room_id,
                    'ref_type' => 'room-invite',
                    'ref_id' => $membership->id,
                    'user_id' => $membership->invitedBy?->id,
                    'name' => $membership->room?->name,
                    'room_name' => $membership->room?->name,
                    'room_icon' => $membership->room?->vibe?->icon,
                    'inviter_name' => $membership->invitedBy?->name,
                    'username' => $membership->invitedBy?->username,
                    'profile_photo' => $membership->room?->cover_url ?? $membership->invitedBy?->profile_photo,
                    'created_at' => $membership->created_at,
                ];
            });

        // Join requests to my rooms where I'm admin (I need to approve)
        $adminRoomIds = RoomMember::query()
            ->where('user_id', $userId)
            ->where('role', 'admin')
            ->where('approved', 1)
            ->pluck('room_id')
            ->unique();

        $roomApprovals = RoomMember::query()
            ->with(['user:id,name,username,profile_photo', 'room:id,name,cover_url,type', 'room.vibe:id,slug,icon'])
            ->whereIn('room_id', $adminRoomIds)
            ->where('approved', 0)
            ->where('accepted', 1)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($membership) {
                return (object) [
                    'id' => $membership->room_id,
                    'ref_type' => 'my-room-allowence',
                    'ref_id' => $membership->id,
                    'user_id' => $membership->user_id,
                    'name' => $membership->user?->name ?? $membership->room?->name,
                    'room_name' => $membership->room?->name,
                    'room_icon' => $membership->room?->vibe?->icon,
                    'username' => $membership->user?->username,
                    'profile_photo' => $membership->user?->profile_photo ?? $membership->room?->cover_url,
                    'created_at' => $membership->created_at,
                ];
            });

        $all = $friendRequests
            ->concat($roomInvitesForMe)
            ->concat($roomApprovals)
            ->sortByDesc('created_at')
            ->values();

        return response()->json(['data' => $all]);
    }

    public function blockedFriends(Request $request)
    {
        $authId = $request->user()->id;

        $blocked = Friendship::query()
            ->where('auth_user_id', $authId)
            ->where('blocked', 1)
            ->with(['friend:id,name,username,profile_photo'])
            ->orderByDesc('updated_at')
            ->get()
            ->map(function ($friendship) {
                $friend = $friendship->friend;
                return (object) [
                    'id' => $friend?->id,
                    'friend_id' => $friend?->id,
                    'name' => $friend?->name,
                    'username' => $friend?->username,
                    'profile_photo' => $friend?->profile_photo,
                    'blocked_at' => $friendship->updated_at,
                ];
            })
            ->filter(fn ($f) => $f->id);

        return response()->json(['data' => $blocked->values()]);
    }

    public function showPublic(User $user)
    {
        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'profile_photo' => $user->profile_photo,
                'avatar' => $user->avatar,
                'sex' => $user->sex,
                'note' => $user->note,
                'coins' => $user->coins ?? 0,
                'is_private' => $user->is_private ?? 0,
            ],
        ]);
    }

    public function profileViews(User $user)
    {
        Log::info('[ProfileViews] fetch', [
            'auth_user_id' => $user->id,
            'route' => request()->path(),
            'query' => request()->query(),
        ]);

        $views = ProfileView::query()
            ->with(['visitor.roomMemberships.room'])
            ->where('auth_user_id', $user->id)
            ->orderByDesc('updated_at')
            ->limit(100)
            ->get()
            ->map(function ($view) {
                $visitor = $view->visitor;
                $firstRoom = $visitor?->roomMemberships?->sortBy('id')->first();
                return [
                    'visitor_id' => $visitor?->id,
                    'name' => $visitor?->name,
                    'username' => $visitor?->username,
                    'profile_photo' => $visitor?->profile_photo,
                    'sex' => $visitor?->sex,
                    'viewed_at' => $view->updated_at,
                    'room_name' => $firstRoom?->room?->name,
                ];
            });

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
        $membershipQuery = $user->roomMemberships()
            ->with('room:id,name')
            ->where('approved', 1)
            ->orderByDesc('id');

        $memberships = $membershipQuery->get();
        $total = $memberships->count();
        $roomNames = $memberships->take(3)->pluck('room.name')->filter()->values();

        return response()->json([
            'total' => $total,
            'rooms' => $roomNames,
        ]);
    }

    public function friendsCount(User $user)
    {
        $count = Friendship::query()
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

        $friendship = Friendship::query()
            ->where(function ($query) use ($authId, $otherId) {
                $query->where('auth_user_id', $authId)->where('user_id', $otherId);
            })
            ->orWhere(function ($query) use ($authId, $otherId) {
                $query->where('auth_user_id', $otherId)->where('user_id', $authId);
            })
            ->first();

        if ($friendship && $friendship->blocked) {
            return response()->json([
                'exists' => true,
                'approved' => (int) ($friendship->approved ?? 0),
                'blocked' => 1,
            ]);
        }

        if (!$friendship) {
            return response()->json([
                'exists' => false,
                'approved' => null,
                'blocked' => 0,
            ]);
        }

        return response()->json([
            'exists' => true,
            'approved' => (int) ($friendship->approved ?? 1),
            'blocked' => 0,
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

        // Always store requester as auth_user_id and target as user_id
        $existing = Friendship::query()
            ->where('auth_user_id', $authId)
            ->where('user_id', $otherId)
            ->orWhere(function ($q) use ($authId, $otherId) {
                $q->where('auth_user_id', $otherId)->where('user_id', $authId);
            })
            ->first();

        if ($existing && $existing->blocked) {
            return response()->json([
                'message' => 'Korisnik ne postoji.',
                'blocked' => 1,
            ], 403);
        }

        if ($existing) {
            $approvedExisting = (int) ($existing->approved ?? 0);
            $status = $approvedExisting ? 'approved' : 'pending';
            Log::info('AddFriend: friendship already exists', [
                'auth_id' => $authId,
                'other_id' => $otherId,
                'friendship_id' => $existing->id ?? null,
                'approved' => $approvedExisting,
            ]);
            return response()->json([
                'message' => $approvedExisting ? 'Već ste prijatelji.' : 'Zahtjev za prijateljstvo već poslan.',
                'approved' => $approvedExisting,
                'status' => $status,
            ], 409);
        }

        $approved = (int) $request->attributes->get('friendship_approved', 1);

        try {
            Friendship::create([
                'auth_user_id' => $authId,
                'user_id' => $otherId,
                'approved' => $approved,
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

        $authId = $authUser->id;
        $otherId = $user->id;

        Log::info("ApproveFriend called", [
            "auth_id" => $authId,
            "other_id" => $otherId,
        ]);

        $updated = Friendship::query()
            ->where('auth_user_id', $otherId) // requester
            ->where('user_id', $authId)       // current user approves
            ->where('approved', 0)
            ->update([
                'approved' => 1,
                'updated_at' => now(),
            ]);

        if (!$updated) {
            Log::warning("ApproveFriend: no pending request found", [
                "auth_id" => $authId,
                "other_id" => $otherId,
            ]);
            return response()->json(['message' => 'Zahtjev nije pronađen.'], 404);
        }

        Log::info("ApproveFriend: request approved", [
            "auth_id" => $authId,
            "other_id" => $otherId,
            "updated" => $updated,
        ]);

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

        Friendship::query()
            ->where('auth_user_id', $low)
            ->where('user_id', $high)
            ->delete();

        return response()->json(['message' => 'Prijatelj uklonjen.'], 200);
    }

    public function unblockUser(Request $request, User $user)
    {
        $authId = $request->user()->id;

        $friendship = Friendship::query()
            ->where('auth_user_id', $authId)
            ->where('user_id', $user->id)
            ->where('blocked', 1)
            ->first();

        if (!$friendship) {
            return response()->json(['message' => 'Korisnik nije na blok listi.'], 404);
        }

        $friendship->blocked = 0;
        $friendship->reported = '0';
        $friendship->save();

        return response()->json(['message' => 'Korisnik je odblokiran.']);
    }

    public function blockUser(Request $request, User $user)
    {
        $authUser = $request->user();

        if ($authUser->id === $user->id) {
            return response()->json(['message' => 'Ne moŽØe­ blokirati sebe.'], 422);
        }

        $friendship = $this->findFriendshipBetween($authUser->id, $user->id);

        if (!$friendship) {
            $friendship = new Friendship([
                'auth_user_id' => $authUser->id,
                'user_id' => $user->id,
                'approved' => 0,
            ]);
        }

        $friendship->blocked = 1;
        $friendship->reported = '0';
        $friendship->approved = 0;
        $friendship->save();

        return response()->json([
            'message' => 'Korisnik je blokiran.',
            'blocked' => 1,
        ]);
    }

    public function reportUser(Request $request, User $user)
    {
        $authUser = $request->user();

        if ($authUser->id === $user->id) {
            return response()->json(['message' => 'Ne moŽØe­ prijaviti sebe.'], 422);
        }

        $data = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $friendship = $this->findFriendshipBetween($authUser->id, $user->id);

        if (!$friendship) {
            $friendship = new Friendship([
                'auth_user_id' => $authUser->id,
                'user_id' => $user->id,
                'approved' => 0,
            ]);
        }

        $friendship->blocked = 1;
        $friendship->reported = $data['message'] ?: '0';
        $friendship->approved = 0;
        $friendship->save();

        return response()->json([
            'message' => 'Korisnik je blokiran i prijavljen.',
            'blocked' => 1,
            'reported' => $friendship->reported,
        ]);
    }

    private function findFriendshipBetween(int $authId, int $otherId): ?Friendship
    {
        return Friendship::query()
            ->where(function ($query) use ($authId, $otherId) {
                $query->where('auth_user_id', $authId)->where('user_id', $otherId);
            })
            ->orWhere(function ($query) use ($authId, $otherId) {
                $query->where('auth_user_id', $otherId)->where('user_id', $authId);
            })
            ->first();
    }

    private function buildFriendsList(int $userId, ?int $roomId = null)
    {
        $friends = Friendship::query()
            ->where(function ($query) use ($userId) {
                $query->where('auth_user_id', $userId)->orWhere('user_id', $userId);
            })
            ->where('approved', 1)
            ->with(['requester:id,name,username,profile_photo', 'friend:id,name,username,profile_photo'])
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(function ($friendship) use ($userId) {
                $isRequester = (int) $friendship->auth_user_id === (int) $userId;
                $other = $isRequester ? $friendship->friend : $friendship->requester;

                return (object) [
                    'id' => $friendship->id,
                    'friend_id' => $other?->id,
                    'name' => $other?->name,
                    'username' => $other?->username,
                    'profile_photo' => $other?->profile_photo,
                    'created_at' => $friendship->created_at,
                ];
            });

        if ($roomId) {
            $memberships = RoomMember::query()
                ->where('room_id', $roomId)
                ->whereIn('user_id', $friends->pluck('friend_id'))
                ->get(['user_id', 'accepted'])
                ->keyBy('user_id');

            $friends = $friends->map(function ($friend) use ($memberships) {
                $membership = $memberships->get($friend->friend_id);
                $friend->is_member = (bool) $membership;
                $friend->accepted = $membership?->accepted ?? null;
                return $friend;
            });
        }

        return $friends;
    }
}
