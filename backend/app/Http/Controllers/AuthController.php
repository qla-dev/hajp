<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'sex' => 'nullable|string|max:10',
        ], [
            'name.required' => 'Ime je obavezno.',
            'username.required' => 'Korisničko ime je obavezno.',
            'username.unique' => 'Korisničko ime je zauzeto.',
            'email.required' => 'Email je obavezan.',
            'email.email' => 'Unesi ispravan email.',
            'email.unique' => 'Email je već iskorišten.',
            'password.required' => 'Lozinka je obavezna.',
            'password.min' => 'Lozinka mora imati najmanje 6 karaktera.',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'sex' => $data['sex'] ?? null,
        ]);

        $token = $user->createToken('api')->plainTextToken;
        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Uspješna registracija i prijava',
        ]);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ], [
            'email.required' => 'Unesi email ili korisničko ime.',
            'password.required' => 'Unesi lozinku.',
        ]);

        $identifier = $data['email'];
        $user = User::where('email', $identifier)
            ->orWhere('username', $identifier)
            ->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['Pogrešni pristupni podaci.']]);
        }
        $token = $user->createToken('api')->plainTextToken;
        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['ok' => true]);
    }
}
