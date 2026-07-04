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

    public function google(Request $request)
    {
        $validated = $request->validate([
            'id_token' => ['required', 'string'],
            'terms_accepted' => ['sometimes', 'boolean'],
        ], [
            'id_token.required' => 'Google token je neophodan.',
        ]);

        $googleUser = $this->verifyGoogleIdToken($validated['id_token']);
        $email = $googleUser['email'] ?? null;
        $googleId = $googleUser['sub'] ?? null;

        if (!$email || !$googleId) {
            throw ValidationException::withMessages([
                'id_token' => ['Google nalog nije vratio ispravan email.'],
            ]);
        }

        $user = User::query()
            ->where('google_id', $googleId)
            ->orWhere('email', $email)
            ->first();
        $isNewUser = false;

        if ($user) {
            if ($user->google_id && $user->google_id !== $googleId) {
                throw ValidationException::withMessages([
                    'id_token' => ['Ovaj email je vec povezan sa drugim Google nalogom.'],
                ]);
            }

            $user->forceFill([
                'google_id' => $user->google_id ?: $googleId,
                'email_verified_at' => $user->email_verified_at ?: now(),
            ])->save();
        } else {
            $name = trim((string) ($googleUser['name'] ?? '')) ?: Str::before($email, '@');
            $user = User::query()->create([
                'name' => $name,
                'username' => $this->generateGoogleUsername($email, $name),
                'email' => $email,
                'google_id' => $googleId,
                'email_verified_at' => now(),
                'password' => Hash::make(Str::random(48)),
            ]);
            $isNewUser = true;
        }

        return response()->json([
            'message' => 'Google prijava je uspjesna.',
            'token' => $user->createToken('api')->plainTextToken,
            'user' => $user->refresh(),
            'is_new_user' => $isNewUser,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['ok' => true]);
    }

    private function verifyGoogleIdToken(string $idToken): array
    {
        $clientIds = config('services.google.client_ids', []);

        if ($clientIds === []) {
            throw ValidationException::withMessages([
                'id_token' => ['Google prijava nije konfigurisana.'],
            ]);
        }

        $response = Http::asJson()->get('https://oauth2.googleapis.com/tokeninfo', [
            'id_token' => $idToken,
        ]);

        if (!$response->ok()) {
            throw ValidationException::withMessages([
                'id_token' => ['Google token nije ispravan.'],
            ]);
        }

        $payload = $response->json();

        if (!in_array($payload['aud'] ?? null, $clientIds, true)) {
            throw ValidationException::withMessages([
                'id_token' => ['Google token nije namijenjen ovoj aplikaciji.'],
            ]);
        }

        if (($payload['email_verified'] ?? null) !== true && ($payload['email_verified'] ?? null) !== 'true') {
            throw ValidationException::withMessages([
                'id_token' => ['Google email nije verifikovan.'],
            ]);
        }

        return $payload;
    }

    private function generateGoogleUsername(string $email, string $name): string
    {
        $base = Str::slug(Str::before($email, '@'), '_')
            ?: Str::slug($name, '_')
            ?: 'hajp';
        $base = Str::lower($base);
        $base = Str::limit($base, 42, '');
        $username = $base;
        $counter = 1;

        while (User::where('username', $username)->exists()) {
            $suffix = "_{$counter}";
            $username = Str::limit($base, 50 - strlen($suffix), '') . $suffix;
            $counter += 1;
        }

        return $username;
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
