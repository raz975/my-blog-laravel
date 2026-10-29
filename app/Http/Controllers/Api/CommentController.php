<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\CommentLike;
use App\Models\Post;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Список комментариев поста
     * GET /api/posts/{postId}/comments
     */
    public function index(Request $request, $postId)
    {
        $post = Post::find($postId);
        if (!$post) {
            return response()->json(['success' => false, 'error' => 'Post not found'], 404);
        }

        $userId = $request->user()?->id ?? 0;

        $comments = Comment::with('user')
            ->withCount('likes')
            ->withCount(['likes as liked_by_me' => function ($q) use ($userId) {
                $q->where('user_id', $userId);
            }])
            ->where('post_id', $postId)
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'post_id' => $c->post_id,
                    'user_id' => $c->user_id,
                    'author' => $c->user->name ?? 'Unknown',
                    'content' => $c->content,
                    'created_at' => $c->created_at,
                    'updated_at' => $c->updated_at,
                    'likes' => (int)$c->likes_count,
                    'liked_by_me' => (int)$c->liked_by_me,
                ];
            });

        return response()->json([
            'success' => true,
            'comments' => $comments,
        ]);
    }

    /**
     * Создать комментарий
     * POST /api/posts/{postId}/comments
     * Body: { content }
     */
    public function store(Request $request, $postId)
    {
        $user = $request->user();

        $post = Post::find($postId);
        if (!$post) {
            return response()->json(['success' => false, 'error' => 'Post not found'], 404);
        }

        $data = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment = Comment::create([
            'post_id' => $postId,
            'user_id' => $user->id,
            'content' => $data['content'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Comment created',
            'id' => $comment->id,
        ], 201);
    }

    /**
     * Обновить комментарий (только автор)
     * PUT /api/comments/{id}
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $comment = Comment::find($id);

        if (!$comment) {
            return response()->json(['success' => false, 'error' => 'Comment not found'], 404);
        }

        if ($comment->user_id !== $user->id) {
            return response()->json(['success' => false, 'error' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment->update(['content' => $data['content']]);

        return response()->json([
            'success' => true,
            'message' => 'Comment updated',
        ]);
    }

    /**
     * Удалить комментарий (автор / владелец поста / admin)
     * DELETE /api/comments/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $comment = Comment::with('post')->find($id);

        if (!$comment) {
            return response()->json(['success' => false, 'error' => 'Comment not found'], 404);
        }

        $isAuthor = $comment->user_id === $user->id;
        $isPostOwner = $comment->post && $comment->post->user_id === $user->id;
        $isAdmin = $user->role === 'admin';

        if (!$isAuthor && !$isPostOwner && !$isAdmin) {
            return response()->json(['success' => false, 'error' => 'Forbidden'], 403);
        }

        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comment deleted',
        ]);
    }

    /**
     * Лайк/анлайк комментария
     * POST /api/comments/{id}/like
     */
    public function like(Request $request, $id)
    {
        $user = $request->user();
        $comment = Comment::find($id);

        if (!$comment) {
            return response()->json(['success' => false, 'error' => 'Comment not found'], 404);
        }

        $existing = CommentLike::where('comment_id', $id)->where('user_id', $user->id)->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
        } else {
            CommentLike::create(['comment_id' => $id, 'user_id' => $user->id]);
            $liked = true;
        }

        $count = CommentLike::where('comment_id', $id)->count();

        return response()->json([
            'success' => true,
            'liked' => $liked,
            'likes' => $count,
        ]);
    }
}