<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    public function show($id)
    {
        $currentUserId = auth('sanctum')->id() ?? 0;
        $user = DB::table('users')->find($id);
        if (!$user) return response()->json(['success' => false, 'message' => 'User not found'], 404);

        $user->followers = DB::table('subscriptions')->where('following_id', $id)->count();
        $user->following = DB::table('subscriptions')->where('follower_id', $id)->count();
        $user->total_likes = DB::table('post_likes')->join('posts', 'post_likes.post_id', '=', 'posts.id')->where('posts.user_id', $id)->count();
        $user->is_subscribed = $currentUserId ? DB::table('subscriptions')->where('follower_id', $currentUserId)->where('following_id', $id)->exists() : false;

        $posts = DB::table('posts')->where('user_id', $id)->orderBy('id', 'desc')->get();
        foreach ($posts as $post) {
            $post->likes = DB::table('post_likes')->where('post_id', $post->id)->count();
            $post->liked_by_me = $currentUserId ? DB::table('post_likes')->where('post_id', $post->id)->where('user_id', $currentUserId)->exists() : false;
            $img = DB::table('post_images')->where('post_id', $post->id)->first();
            $post->image_url = $img ? '/uploads/' . $img->file_name : null;
        }
        $user->posts = $posts;

        return response()->json(['success' => true, 'data' => $user]);
    }

    public function me()
    {
        $id = auth()->id();
        $user = DB::table('users')->find($id);
        $user->followers = DB::table('subscriptions')->where('following_id', $id)->count();
        $user->following = DB::table('subscriptions')->where('follower_id', $id)->count();
        $user->total_likes = DB::table('post_likes')->join('posts', 'post_likes.post_id', '=', 'posts.id')->where('posts.user_id', $id)->count();
        $user->is_subscribed = false;
        
        $posts = DB::table('posts')->where('user_id', $id)->orderBy('id', 'desc')->get();
        foreach ($posts as $post) {
            $post->likes = DB::table('post_likes')->where('post_id', $post->id)->count();
            $post->liked_by_me = DB::table('post_likes')->where('post_id', $post->id)->where('user_id', $id)->exists();
            $img = DB::table('post_images')->where('post_id', $post->id)->first();
            $post->image_url = $img ? '/uploads/' . $img->file_name : null;
        }
        $user->posts = $posts;
        return response()->json(['success' => true, 'data' => $user]); 
    }

    public function subscribe($id)
    {
        $currentId = auth()->id();
        if ($currentId == $id) return response()->json(['success' => false, 'message' => 'Нельзя подписаться на себя'], 400);
        $exists = DB::table('subscriptions')->where('follower_id', $currentId)->where('following_id', $id)->exists();
        if (!$exists) {
            DB::table('subscriptions')->insert(['follower_id' => $currentId, 'following_id' => $id, 'created_at' => now()]);
        }
        return response()->json(['success' => true]);
    }

    public function unsubscribe($id)
    {
        DB::table('subscriptions')->where('follower_id', auth()->id())->where('following_id', $id)->delete();
        return response()->json(['success' => true]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255', 'email' => 'required|email|unique:users,email,'.auth()->id()]);
        DB::table('users')->where('id', auth()->id())->update(['name' => $request->name, 'email' => $request->email]);
        return response()->json(['success' => true]);
    }

    public function changePassword(Request $request)
    {
        $request->validate(['old_password' => 'required', 'new_password' => 'required|min:6']);
        $user = DB::table('users')->find(auth()->id());
        if (!password_verify($request->old_password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Неверный текущий пароль'], 400);
        }
        DB::table('users')->where('id', auth()->id())->update(['password' => bcrypt($request->new_password)]);
        return response()->json(['success' => true]);
    }
}