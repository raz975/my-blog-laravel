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
        
        $query = DB::table('posts');

        if ($search) {
            $query->where('title', 'like', "%{$search}%");
        }

        // Сортируем посты
        try {
            $posts = $query->orderBy('created_at', 'desc')->get();
        } catch (\Exception $e) {
            $posts = $query->orderBy('id', 'desc')->get();
        }

        // ВОТ ГЛАВНЫЙ БЛОК: прикрепляем картинки и лайки
        foreach ($posts as $post) {
            // 1. Лайки
            $post->likes = DB::table('post_likes')->where('post_id', $post->id)->count();
            $post->liked_by_me = DB::table('post_likes')->where('post_id', $post->id)->where('user_id', $userId)->exists();
            
            // 2. Картинки
            $img = DB::table('post_images')->where('post_id', $post->id)->first();
            $post->image_url = $img ? '/uploads/' . $img->file_name : null;
        }

        return response()->json(['success' => true, 'data' => $posts]);
    }
}