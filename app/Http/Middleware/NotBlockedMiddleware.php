<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;

class NotBlockedMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        // ⚠️ Загружаем актуальное значение is_blocked из БД (не из токена!)
        $freshUser = User::find($user->id);

        if ($freshUser && (int)$freshUser->is_blocked === 1) {
            return response()->json(['success' => false, 'error' => 'Your account is blocked'], 403);
        }

        return $next($request);
    }
}