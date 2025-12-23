<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class SubscriptionController extends Controller
{
    public function status(Request $request)
    {
        $subscription = Subscription::where('user_id', $request->user()->id)->first();
        return response()->json(['subscription' => $subscription]);
    }

    public function subscribe(Request $request)
    {
        $data = $request->validate([
            'plan' => 'sometimes|string',
            'expires_at' => 'sometimes|date',
            'duration_days' => 'sometimes|integer|min:1',
        ]);

        $plan = strtolower($data['plan'] ?? '');
        $expiresAt = isset($data['expires_at']) ? Carbon::parse($data['expires_at']) : null;
        $durationDays = isset($data['duration_days']) ? (int) $data['duration_days'] : 0;

        $planDays = match ($plan) {
            'daily' => 1,
            'weekly' => 7,
            'yearly', 'annual', 'annually' => 365,
            default => 30,
        };

        $effectiveDays = $durationDays > 0 ? $durationDays : $planDays;

        $minExpires = Carbon::now()->addDays($effectiveDays);

        if (!$expiresAt) {
            $expiresAt = $minExpires;
        } elseif ($expiresAt->lessThan($minExpires)) {
            // Ensure at least the duration we expect for the selected plan
            $expiresAt = $minExpires;
        }

        Log::info('Subscription sync', [
            'user_id' => $request->user()->id,
            'plan' => $plan,
            'duration_days' => $durationDays,
            'effective_days' => $effectiveDays,
            'expires_at' => $expiresAt->toIso8601String(),
        ]);

        $subscription = Subscription::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['expires_at' => $expiresAt]
        );
        $request->user()->is_subscribed = true;
        $request->user()->save();
        return response()->json(['subscription' => $subscription]);
    }
}
