<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth('sanctum')->id() ?? 0;
        $search = $request->query('search');
        
        $query = DB::table('posts')
            ->leftJoin('users', 'posts.user_id', '=', 'users.id')
            ->select('posts.*', 'users.name as author');

        if ($search) {
            $query->where('posts.title', 'like', "%{$search}%");
        }

        try {
            $posts = $query->orderBy('posts.created_at', 'desc')->get();
        } catch (\Exception $e) {
            $posts = $query->orderBy('posts.id', 'desc')->get();
        }

        foreach ($posts as $post) {
            $post->likes = DB::table('post_likes')->where('post_id', $post->id)->count();
            $post->liked_by_me = DB::table('post_likes')->where('post_id', $post->id)->where('user_id', $userId)->exists();
            
            $img = DB::table('post_images')->where('post_id', $post->id)->first();
            $post->image_url = $img ? '/uploads/' . $img->file_name : null;
        }

        return response()->json(['success' => true, 'data' => $posts]);
    }
}