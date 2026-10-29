<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// === Публичные роуты ===
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// === Защищённые роуты (требуется токен) ===
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/update-profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/change-password', [AuthController::class, 'changePassword']);
});

// Тестовый роут (можешь оставить для проверки БД)
Route::get('/test', function () {
    try {
        $users = \Illuminate\Support\Facades\DB::table('users')->count();
        return response()->json([
            'success' => true,
            'message' => 'БД работает!',
            'users_count' => $users,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
        ], 500);
    }
});