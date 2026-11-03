<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommentController extends Controller
{
    public function index($postId)
    {
        $comments = DB::table('comments')
            ->join('users', 'comments.user_id', '=', 'users.id')
            ->select('comments.*', 'users.name as author_name')
            ->where('comments.post_id', $postId)
            ->orderBy('comments.id', 'desc')
            ->get();
        return response()->json(['success' => true, 'data' => $comments]);
    }

    public function store(Request $request, $postId)
    {
        $request->validate(['content' => 'required|string|max:1000']);
        $commentId = DB::table('comments')->insertGetId([
            'post_id' => $postId, 'user_id' => auth()->id(), 'content' => $request->input('content'), 'created_at' => now()
        ]);
        $newComment = DB::table('comments')->join('users', 'comments.user_id', '=', 'users.id')
            ->select('comments.*', 'users.name as author_name')
            ->where('comments.id', $commentId)->first();
        return response()->json(['success' => true, 'data' => $newComment]);
    }

    public function update(Request $request, $id)
    {
        $comment = DB::table('comments')->find($id);
        if (!$comment) return response()->json(['success' => false, 'message' => 'Комментарий не найден'], 404);
        if ($comment->user_id !== auth()->id()) return response()->json(['success' => false, 'message' => 'Чужой коммент'], 403);
        
        $request->validate(['content' => 'required|string|max:1000']);
        DB::table('comments')->where('id', $id)->update(['content' => $request->input('content')]);
        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        $comment = DB::table('comments')->find($id);
        if (!$comment) return response()->json(['success' => false, 'message' => 'Комментарий не найден'], 404);
        
        $post = DB::table('posts')->find($comment->post_id);
        
        $isCommentAuthor = $comment->user_id === auth()->id();
        $isAdmin = auth()->user()->role === 'admin';
        $isPostOwner = $post && $post->user_id === auth()->id();

        if (!$isCommentAuthor && !$isAdmin && !$isPostOwner) {
            return response()->json(['success' => false, 'message' => 'Нет прав на удаление'], 403);
        }
        
        DB::table('comments')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}