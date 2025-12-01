<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
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
}
