<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class CheckFriendPrivacy
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $routeUser = $request->route('user');

        if ($routeUser instanceof User) {
            $target = $routeUser;
        } elseif (!empty($routeUser)) {
            $target = User::find($routeUser);
        } else {
            $target = null;
        }

        $approved = 1;
        if ($target && $target->is_private) {
            $approved = 0;
        }

        Log::info('CheckFriendPrivacy', [
            'auth_id' => $request->user()?->id,
            'target_id' => $target?->id,
            'is_private' => $target?->is_private ?? null,
            'approved' => $approved,
            'route_user_param' => $routeUser,
        ]);

        $request->attributes->set('friendship_approved', $approved);

        return $next($request);
    }
}
