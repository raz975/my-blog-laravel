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

        try {
            $posts = $query->orderBy('created_at', 'desc')->get();
        } catch (\Exception $e) {
            $posts = $query->orderBy('id', 'desc')->get();
        }

        foreach ($posts as $post) {
            $post->likes = DB::table('post_likes')->where('post_id', $post->id)->count();
            $post->liked_by_me = $userId ? DB::table('post_likes')->where('post_id', $post->id)->where('user_id', $userId)->exists() : false;
            $img = DB::table('post_images')->where('post_id', $post->id)->first();
            $post->image_url = $img ? '/uploads/' . $img->file_name : null;
            
            $author = DB::table('users')->find($post->user_id);
            $post->author = $author ? $author->name : 'Unknown';
        }

        return response()->json(['success' => true, 'data' => $posts]);
    }

    public function show($id)
    {
        $userId = auth('sanctum')->id() ?? 0;
        $post = DB::table('posts')->find($id);
        if (!$post) return response()->json(['success' => false, 'message' => 'Post not found'], 404);

        $post->likes = DB::table('post_likes')->where('post_id', $id)->count();
        $post->liked_by_me = $userId ? DB::table('post_likes')->where('post_id', $id)->where('user_id', $userId)->exists() : false;
        $img = DB::table('post_images')->where('post_id', $id)->first();
        $post->image_url = $img ? '/uploads/' . $img->file_name : null;

        return response()->json(['success' => true, 'data' => $post]);
    }

    public function store(Request $request)
    {
        $request->validate(['title' => 'required|string|max:255', 'content' => 'required|string|max:5000']);
        try {
            $id = DB::table('posts')->insertGetId([
                'title' => $request->title, 'content' => $request->content, 'user_id' => auth()->id(), 'created_at' => now() 
            ]);
            return response()->json(['success' => true, 'data' => DB::table('posts')->find($id)]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $post = DB::table('posts')->find($id);
        if (!$post) return response()->json(['success' => false, 'message' => 'Пост не найден'], 404);
        if ($post->user_id !== auth()->id()) return response()->json(['success' => false, 'message' => 'Чужой пост'], 403);
        
        $request->validate(['title' => 'required|string|max:255', 'content' => 'required|string|max:5000']);
        DB::table('posts')->where('id', $id)->update(['title' => $request->title, 'content' => $request->content]);
        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        $post = DB::table('posts')->find($id);
        if (!$post) return response()->json(['success' => false, 'message' => 'Пост не найден'], 404);
        if ($post->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Нет прав на удаление'], 403);
        }
        DB::table('posts')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    public function like($id)
    {
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
    }

    public function uploadImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
                'post_id' => 'required|integer|exists:posts,id'
            ]);

            $post = DB::table('posts')->find($request->post_id);
            if ($post->user_id !== auth()->id()) {
                return response()->json(['success' => false, 'message' => 'Вы не можете загружать картинки к чужому посту'], 403);
            }

            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $destinationPath = public_path('uploads');
                if (!file_exists($destinationPath)) mkdir($destinationPath, 0777, true);
                
                $file->move($destinationPath, $filename);
                DB::table('post_images')->insert(['post_id' => $request->post_id, 'file_name' => $filename, 'created_at' => now()]);

                return response()->json(['success' => true, 'filename' => $filename]);
            }
            return response()->json(['success' => false, 'message' => 'Файл не получен'], 400);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Ошибка сервера: ' . $e->getMessage()], 500);
        }
    }
}