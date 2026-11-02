<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MenuController;

Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{id}', [PostController::class, 'show']);
Route::get('/menu', [MenuController::class, 'index']);
Route::get('/languages', [AdminController::class, 'languages']);
Route::get('/users/{id}/profile', [ProfileController::class, 'show']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user(); });
    Route::get('/users/me/profile', [ProfileController::class, 'me']);
    Route::put('/auth/update-profile', [ProfileController::class, 'updateProfile']);
    Route::put('/auth/change-password', [ProfileController::class, 'changePassword']);
    Route::post('/users/{id}/subscribe', [ProfileController::class, 'subscribe']);
    Route::post('/users/{id}/unsubscribe', [ProfileController::class, 'unsubscribe']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::put('/posts/{id}', [PostController::class, 'update']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    Route::post('/posts/{id}/like', [PostController::class, 'like']);
    Route::post('/images/upload', [PostController::class, 'uploadImage']);
    Route::get('/posts/{id}/comments', [CommentController::class, 'index']);
    Route::post('/posts/{id}/comments', [CommentController::class, 'store']);
    Route::put('/comments/{id}', [CommentController::class, 'update']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
    Route::middleware('admin')->group(function () {
        Route::get('/admin/languages', [AdminController::class, 'languages']);
        Route::post('/admin/languages', [AdminController::class, 'createLanguage']);
        Route::put('/admin/languages/{id}', [AdminController::class, 'updateLanguage']);
        Route::delete('/admin/languages/{id}', [AdminController::class, 'deleteLanguage']);

        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::put('/admin/users/{id}/block', [AdminController::class, 'blockUser']);
        Route::put('/admin/users/{id}/role', [AdminController::class, 'changeRole']);
        Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);

        Route::get('/admin/menu', [MenuController::class, 'index']);
        Route::post('/admin/menu', [MenuController::class, 'store']);
        Route::put('/admin/menu/reorder', [MenuController::class, 'reorder']);
        Route::put('/admin/menu/{id}', [MenuController::class, 'update']);
        Route::delete('/admin/menu/{id}', [MenuController::class, 'destroy']);
    });
});