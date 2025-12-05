<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;

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

        $request->attributes->set('friendship_approved', $approved);

        return $next($request);
    }
}
