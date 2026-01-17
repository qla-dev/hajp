<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => [
                'required',
                'string',
                'min:6',
                'regex:/^(?=.*[A-Z])(?=.*\d).{6,}$/',
                'confirmed',
            ],
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
            'password.regex' => 'Lozinka mora imati najmanje jedno veliko slovo i jedan broj.',
            'password.confirmed' => 'Lozinka i potvrda moraju biti iste.',
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

    public function googleLogin(Request $request)
    {
        $data = $request->validate([
            'id_token' => 'required|string',
        ], [
            'id_token.required' => 'Google token je neophodan.',
        ]);

        $response = Http::asForm()->get('https://oauth2.googleapis.com/tokeninfo', [
            'id_token' => $data['id_token'],
        ]);

        if (!$response->ok()) {
            throw ValidationException::withMessages(['id_token' => ['Google verifikacija nije uspjela.']]);
        }

        $payload = $response->json();
        $clientId = config('services.google.client_id');
        if ($clientId && ($payload['aud'] ?? '') !== $clientId) {
            throw ValidationException::withMessages(['id_token' => ['Google klijent nije prepoznat.']]);
        }

        if (empty($payload['email'])) {
            throw ValidationException::withMessages(['id_token' => ['Google token ne sadrži email adresu.']]);
        }

        $email = $payload['email'];
        $user = User::where('email', $email)->first();
        $isNewUser = false;

        if (!$user) {
            $isNewUser = true;
            $user = User::create([
                'name' => $payload['name'] ?? $email,
                'email' => $email,
                'username' => $this->generateUsername($payload, $email),
                'password' => Hash::make(Str::random(16)),
            ]);
        } else {
            $incomingName = $payload['name'] ?? null;
            if ($incomingName && $incomingName !== $user->name) {
                $user->name = $incomingName;
                $user->save();
            }
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'is_new_user' => $isNewUser,
            'message' => $isNewUser ? 'Uspješna registracija i prijava' : 'Uspješna prijava',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['ok' => true]);
    }

    private function generateUsername(array $payload, string $email): string
    {
        $base = Str::slug($payload['name'] ?? explode('@', $email)[0] ?? 'user', '_');
        $base = $base ?: 'user';
        $username = Str::limit($base, 50, '');
        $counter = 0;
        while (User::where('username', $username)->exists()) {
            $counter++;
            $suffix = (string) $counter;
            $maxLength = max(1, 50 - strlen($suffix));
            $username = Str::limit($base, $maxLength, '') . $suffix;
        }
        return $username;
    }
}
