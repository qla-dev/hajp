<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'sex' => 'sometimes|nullable|string|max:10',
            'school' => 'sometimes|nullable|string|max:255',
            'grade' => 'sometimes|nullable|string|max:255',
            'profile_photo' => 'sometimes|nullable|url',
        ]);

        $user->fill($data);
        $user->save();

        return response()->json($user);
    }
}
