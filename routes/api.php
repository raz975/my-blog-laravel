<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\LanguageController;
use App\Http\Controllers\Api\MenuItemController;

// === Публичные ===
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/languages', [LanguageController::class, 'list']);

// === Защищённые ===
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/update-profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/change-password', [AuthController::class, 'changePassword']);

    // Posts
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/{id}', [PostController::class, 'show']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::put('/posts/{id}', [PostController::class, 'update']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    Route::post('/posts/{id}/like', [PostController::class, 'like']);

    // Comments
    Route::get('/posts/{postId}/comments', [CommentController::class, 'index']);
    Route::post('/posts/{postId}/comments', [CommentController::class, 'store']);
    Route::put('/comments/{id}', [CommentController::class, 'update']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
    Route::post('/comments/{id}/like', [CommentController::class, 'like']);

    // Admin Users
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::put('/admin/users/{id}/block', [AdminUserController::class, 'block']);
    Route::put('/admin/users/{id}/role', [AdminUserController::class, 'changeRole']);
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);

    // Languages
    Route::get('/admin/languages', [LanguageController::class, 'index']);
    Route::post('/admin/languages', [LanguageController::class, 'store']);
    Route::put('/admin/languages/{id}', [LanguageController::class, 'update']);
    Route::delete('/admin/languages/{id}', [LanguageController::class, 'destroy']);
    Route::put('/admin/languages/{id}/set-active', [LanguageController::class, 'setActive']);

    // Menu (публичное)
    Route::get('/menu', [MenuItemController::class, 'index']);

    // Menu (admin)
    Route::get('/admin/menu', [MenuItemController::class, 'adminIndex']);
    Route::post('/admin/menu', [MenuItemController::class, 'store']);
    Route::put('/admin/menu/reorder', [MenuItemController::class, 'reorder']);  // ← ВАЖНО: до /{id}!
    Route::put('/admin/menu/{id}', [MenuItemController::class, 'update']);
    Route::delete('/admin/menu/{id}', [MenuItemController::class, 'destroy']);
});

// === Тест ===
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