<?php

namespace App\Http\Middleware;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

use Closure;
use Illuminate\Http\Request;

class SystemRoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        if ($user) {
            Log::info('Request User object: ' . json_encode($user));
            Log::info('Auth User object: ' . json_encode(Auth::user()));
            if (isset($user->role) && $user->role === 'system') {
                return $next($request);
            }
        }

        return response('Unauthorized.', 403);
    }
}
