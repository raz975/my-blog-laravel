<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\PostController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ImageController;

Route::get('/posts', [PostController::class, 'index']);
Route::get('/menu', [MenuController::class, 'index']);
Route::get('/images/{postId}', [ImageController::class, 'show']);

Route::get('/languages', function () {
    return response()->json(['success' => true, 'data' => DB::table('languages')->get()]);
});

Route::get('/posts/{id}', function ($id) {
    $userId = auth('sanctum')->id() ?? 0;
    
    $post = DB::table('posts')
        ->leftJoin('users', 'posts.user_id', '=', 'users.id')
        ->select('posts.*', 'users.name as author')
        ->where('posts.id', $id)
        ->first();

    if (!$post) return response()->json(['success' => false, 'message' => 'Post not found'], 404);

    $post->likes = DB::table('post_likes')->where('post_id', $id)->count();
    $post->liked_by_me = $userId ? DB::table('post_likes')->where('post_id', $id)->where('user_id', $userId)->exists() : false;
    
    $img = DB::table('post_images')->where('post_id', $id)->first();
    $post->image_url = $img ? '/uploads/' . $img->file_name : null;

    return response()->json(['success' => true, 'data' => $post]);
});

Route::get('/users/{id}/profile', function ($id) {
    $currentUserId = auth('sanctum')->id() ?? 0;
    $user = DB::table('users')->find($id);
    if (!$user) return response()->json(['success' => false, 'message' => 'User not found'], 404);

    $user->followers = DB::table('subscriptions')->where('following_id', $id)->count();
    $user->following = DB::table('subscriptions')->where('follower_id', $id)->count();
    $user->total_likes = DB::table('post_likes')->join('posts', 'post_likes.post_id', '=', 'posts.id')->where('posts.user_id', $id)->count();
    $user->is_subscribed = $currentUserId ? DB::table('subscriptions')->where('follower_id', $currentUserId)->where('following_id', $id)->exists() : false;

    $posts = DB::table('posts')
        ->leftJoin('users', 'posts.user_id', '=', 'users.id')
        ->select('posts.*', 'users.name as author')
        ->where('posts.user_id', $id)
        ->orderBy('posts.id', 'desc')
        ->get();

    foreach ($posts as $post) {
        $post->likes = DB::table('post_likes')->where('post_id', $post->id)->count();
        $post->liked_by_me = $currentUserId ? DB::table('post_likes')->where('post_id', $post->id)->where('user_id', $currentUserId)->exists() : false;
        $img = DB::table('post_images')->where('post_id', $post->id)->first();
        $post->image_url = $img ? '/uploads/' . $img->file_name : null;
    }
    $user->posts = $posts;

    return response()->json(['success' => true, 'data' => $user]);
});

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/images/upload', function (Request $request) {
        $request->validate(['image' => 'required|image', 'post_id' => 'required|integer']);
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads'), $filename);
            DB::table('post_images')->insert(['post_id' => $request->post_id, 'file_name' => $filename, 'created_at' => now()]);
            return response()->json(['success' => true, 'filename' => $filename]);
        }
        return response()->json(['success' => false], 400);
    });

    Route::get('/user', function (Request $request) { return $request->user(); });
    
    Route::get('/users/me/profile', function () { 
        $id = auth()->id();
        $user = DB::table('users')->find($id);
        $user->followers = DB::table('subscriptions')->where('following_id', $id)->count();
        $user->following = DB::table('subscriptions')->where('follower_id', $id)->count();
        $user->total_likes = DB::table('post_likes')->join('posts', 'post_likes.post_id', '=', 'posts.id')->where('posts.user_id', $id)->count();
        $user->is_subscribed = false;
        
        $posts = DB::table('posts')
            ->leftJoin('users', 'posts.user_id', '=', 'users.id')
            ->select('posts.*', 'users.name as author')
            ->where('posts.user_id', $id)
            ->orderBy('posts.id', 'desc')
            ->get();

        foreach ($posts as $post) {
            $post->likes = DB::table('post_likes')->where('post_id', $post->id)->count();
            $post->liked_by_me = DB::table('post_likes')->where('post_id', $post->id)->where('user_id', $id)->exists();
            $img = DB::table('post_images')->where('post_id', $post->id)->first();
            $post->image_url = $img ? '/uploads/' . $img->file_name : null;
        }
        $user->posts = $posts;
        return response()->json(['success' => true, 'data' => $user]); 
    });

    Route::post('/users/{id}/subscribe', function ($id) {
        $currentId = auth()->id();
        if ($currentId == $id) return response()->json(['success' => false, 'message' => 'Нельзя подписаться на себя'], 400);
        $exists = DB::table('subscriptions')->where('follower_id', $currentId)->where('following_id', $id)->exists();
        if (!$exists) {
            DB::table('subscriptions')->insert(['follower_id' => $currentId, 'following_id' => $id, 'created_at' => now()]);
        }
        return response()->json(['success' => true]);
    });
    
    Route::post('/users/{id}/unsubscribe', function ($id) {
        DB::table('subscriptions')->where('follower_id', auth()->id())->where('following_id', $id)->delete();
        return response()->json(['success' => true]);
    });

    Route::put('/auth/update-profile', function (Request $request) {
        DB::table('users')->where('id', auth()->id())->update([
            'name' => $request->name, 'email' => $request->email,
        ]);
        return response()->json(['success' => true]);
    });

    Route::put('/auth/change-password', function (Request $request) {
        $user = DB::table('users')->find(auth()->id());
        if (!password_verify($request->old_password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Неверный текущий пароль'], 400);
        }
        DB::table('users')->where('id', auth()->id())->update(['password' => bcrypt($request->new_password)]);
        return response()->json(['success' => true]);
    });

    Route::get('/admin/languages', function () { return response()->json(['success' => true, 'data' => DB::table('languages')->get()]); });
    Route::post('/admin/languages', function (Request $request) {
        $id = DB::table('languages')->insertGetId(['code' => $request->code, 'name' => $request->name, 'is_active' => $request->is_active ?? 1]);
        return response()->json(['success' => true, 'data' => DB::table('languages')->find($id)]);
    });
    Route::put('/admin/languages/{id}', function (Request $request, $id) {
        DB::table('languages')->where('id', $id)->update(['code' => $request->code, 'name' => $request->name, 'is_active' => $request->is_active ?? 1]);
        return response()->json(['success' => true]);
    });
    Route::delete('/admin/languages/{id}', function ($id) {
        DB::table('languages')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    });

    Route::get('/admin/menu', [MenuController::class, 'index']);
    Route::post('/admin/menu', [MenuController::class, 'store']);
    Route::put('/admin/menu/reorder', function (Request $request) {
        foreach ($request->input('items', []) as $item) {
            DB::table('menu_items')->where('id', $item['id'])->update(['sort_order' => $item['sort_order'], 'parent_id' => $item['parent_id'] ?: null]);
        }
        return response()->json(['success' => true]);
    });
    Route::put('/admin/menu/{id}', function (Request $request, $id) {
        DB::table('menu_items')->where('id', $id)->update(['name' => $request->name ?? $request->title, 'url' => $request->url, 'parent_id' => $request->parent_id ?: null]);
        return response()->json(['success' => true]);
    });
    Route::delete('/admin/menu/{id}', [MenuController::class, 'destroy']);

    Route::get('/admin/users', function () { return response()->json(['success' => true, 'data' => DB::table('users')->get()]); });
    Route::put('/admin/users/{id}/block', function (Request $request, $id) {
        DB::table('users')->where('id', $id)->update(['is_blocked' => $request->is_blocked]);
        return response()->json(['success' => true]);
    });
    Route::put('/admin/users/{id}/role', function (Request $request, $id) {
        DB::table('users')->where('id', $id)->update(['role' => $request->role]);
        return response()->json(['success' => true]);
    });
    Route::delete('/admin/users/{id}', function ($id) {
        DB::table('users')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    });

    Route::post('/posts', function (Request $request) {
        $id = DB::table('posts')->insertGetId(['title' => $request->title, 'content' => $request->content, 'user_id' => auth()->id(), 'created_at' => now()]);
        return response()->json(['success' => true, 'data' => DB::table('posts')->find($id)]);
    });
    
    Route::put('/posts/{id}', function (Request $request, $id) {
        $post = DB::table('posts')->find($id);
        if ($post->user_id !== auth()->id()) return response()->json(['success' => false, 'message' => 'Чужой пост'], 403);
        DB::table('posts')->where('id', $id)->update(['title' => $request->title, 'content' => $request->content]);
        return response()->json(['success' => true]);
    });
    
    Route::delete('/posts/{id}', function ($id) {
        DB::table('posts')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    });

    Route::post('/posts/{id}/like', function (Request $request, $id) {
        $userId = auth()->id();
        $existingLike = DB::table('post_likes')->where('post_id', $id)->where('user_id', $userId)->first();
        if ($existingLike) {
            DB::table('post_likes')->where('id', $existingLike->id)->delete();
            $liked = false;
        } else {
            DB::table('post_likes')->insert(['post_id' => $id, 'user_id' => $userId]);
            $liked = true;
        }
        return response()->json(['success' => true, 'likes' => DB::table('post_likes')->where('post_id', $id)->count(), 'liked' => $liked]);
    });

    Route::get('/posts/{id}/comments', function ($id) { 
        $comments = DB::table('comments')->join('users', 'comments.user_id', '=', 'users.id')->select('comments.*', 'users.name as author_name')->where('comments.post_id', $id)->orderBy('comments.id', 'desc')->get();
        return response()->json(['success' => true, 'data' => $comments]); 
    });
    Route::post('/posts/{id}/comments', function (Request $request, $id) {
        $text = $request->input('content') ?? $request->input('text') ?? $request->input('body');
        $commentId = DB::table('comments')->insertGetId(['post_id' => $id, 'user_id' => auth()->id(), 'content' => $text, 'created_at' => now()]);
        $newComment = DB::table('comments')->join('users', 'comments.user_id', '=', 'users.id')->select('comments.*', 'users.name as author_name')->where('comments.id', $commentId)->first();
        return response()->json(['success' => true, 'data' => $newComment]);
    });
    Route::put('/comments/{id}', function (Request $request, $id) {
        $comment = DB::table('comments')->find($id);
        if ($comment->user_id !== auth()->id()) return response()->json(['success' => false, 'message' => 'Чужой коммент'], 403);
        $text = $request->input('content') ?? $request->input('text');
        DB::table('comments')->where('id', $id)->update(['content' => $text]);
        return response()->json(['success' => true]);
    });
    Route::delete('/comments/{id}', function ($id) {
        DB::table('comments')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    });
});