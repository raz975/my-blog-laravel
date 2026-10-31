<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostLike;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    /**
     * Подписаться на юзера
     * POST /api/users/{id}/subscribe
     */
    public function subscribe(Request $request, $id)
    {
        $user = $request->user();
        $targetId = (int)$id;

        if ($targetId <= 0 || $targetId === $user->id) {
            return response()->json(['success' => false, 'error' => 'Invalid user'], 400);
        }

        $target = User::find($targetId);
        if (!$target) {
            return response()->json(['success' => false, 'error' => 'User not found'], 404);
        }

        Subscription::firstOrCreate([
            'follower_id' => $user->id,
            'following_id' => $targetId,
        ]);

        $followers = Subscription::where('following_id', $user->id)->count();
        $following = Subscription::where('follower_id', $user->id)->count();

        return response()->json([
            'success' => true,
            'subscribed' => true,
            'followers' => $followers,
            'following' => $following,
        ]);
    }

    /**
     * Отписаться
     * POST /api/users/{id}/unsubscribe
     */
    public function unsubscribe(Request $request, $id)
    {
        $user = $request->user();
        $targetId = (int)$id;

        Subscription::where('follower_id', $user->id)
            ->where('following_id', $targetId)
            ->delete();

        $followers = Subscription::where('following_id', $user->id)->count();
        $following = Subscription::where('follower_id', $user->id)->count();

        return response()->json([
            'success' => true,
            'subscribed' => false,
            'followers' => $followers,
            'following' => $following,
        ]);
    }

    /**
     * Чужой профиль (посты + статистика + is_subscribed)
     * GET /api/users/{id}/profile
     */
    public function getProfile(Request $request, $id)
    {
        $currentUser = $request->user();
        $targetId = (int)$id;

        $target = User::find($targetId);
        if (!$target) {
            return response()->json(['success' => false, 'error' => 'User not found'], 404);
        }

        $followers = Subscription::where('following_id', $targetId)->count();
        $following = Subscription::where('follower_id', $targetId)->count();

        $likesReceived = PostLike::whereIn('post_id', function ($q) use ($targetId) {
            $q->select('id')->from('posts')->where('user_id', $targetId);
        })->count();

        $isSubscribed = Subscription::where('follower_id', $currentUser->id)
            ->where('following_id', $targetId)
            ->exists();

        // Посты с картинками
        $posts = Post::with(['image'])
            ->withCount('likes')
            ->withCount(['likes as liked_by_me' => function ($q) use ($currentUser) {
                $q->where('user_id', $currentUser->id);
            }])
            ->where('user_id', $targetId)
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'content' => $p->content,
                    'created_at' => $p->created_at,
                    'likes' => (int)$p->likes_count,
                    'liked_by_me' => (int)$p->liked_by_me,
                    'image_url' => $p->image ? '/uploads/' . $p->image->file_name : null,
                ];
            });

        return response()->json([
            'success' => true,
            'profile' => [
                'id' => $target->id,
                'name' => $target->name,
                'email' => $target->email,
                'role' => $target->role,
                'followers' => $followers,
                'following' => $following,
                'likes_received' => $likesReceived,
                'is_subscribed' => $isSubscribed,
                'posts' => $posts,
            ],
        ]);
    }

    /**
     * Свой профиль
     * GET /api/users/me/profile
     */
    public function getMyProfile(Request $request)
    {
        $user = $request->user();

        $followers = Subscription::where('following_id', $user->id)->count();
        $following = Subscription::where('follower_id', $user->id)->count();

        $likesReceived = PostLike::whereIn('post_id', function ($q) use ($user) {
            $q->select('id')->from('posts')->where('user_id', $user->id);
        })->count();

        $posts = Post::with(['image'])
            ->withCount('likes')
            ->withCount(['likes as liked_by_me' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }])
            ->where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'content' => $p->content,
                    'created_at' => $p->created_at,
                    'likes' => (int)$p->likes_count,
                    'liked_by_me' => (int)$p->liked_by_me,
                    'image_url' => $p->image ? '/uploads/' . $p->image->file_name : null,
                ];
            });

        return response()->json([
            'success' => true,
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'followers' => $followers,
                'following' => $following,
                'likes_received' => $likesReceived,
                'posts' => $posts,
            ],
        ]);
    }
}