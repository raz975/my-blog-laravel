<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Comment;

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
        $comment = Comment::find($id);
        if (!$comment) return response()->json(['success' => false, 'message' => 'Комментарий не найден'], 404);
        
        $this->authorize('update', $comment);
        
        $request->validate(['content' => 'required|string|max:1000']);
        $comment->update(['content' => $request->input('content')]);
        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        $comment = Comment::find($id);
        if (!$comment) return response()->json(['success' => false, 'message' => 'Комментарий не найден'], 404);
        
        $this->authorize('delete', $comment);
        
        $comment->delete();
        return response()->json(['success' => true]);
    }
}