<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class SubscriptionController extends Controller
{
    public function status(Request $request)
    {
        $subscription = Subscription::where('user_id', $request->user()->id)->first();
        return response()->json(['subscription' => $subscription]);
    }

    public function subscribe(Request $request)
    {
        $expires = Carbon::now()->addDays(30);
        $subscription = Subscription::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['expires_at' => $expires]
        );
        $request->user()->is_subscribed = true;
        $request->user()->save();
        return response()->json(['subscription' => $subscription]);
    }
}
