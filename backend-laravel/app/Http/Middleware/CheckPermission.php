<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CheckPermission
{
    public function handle(Request $request, Closure $next, $permission)
    {
        if (!Gate::allows($permission)) {
            return response()->json(['success' => false, 'message' => 'У вас нет прав для этого действия.'], 403);
        }

        return $next($request);
    }
}