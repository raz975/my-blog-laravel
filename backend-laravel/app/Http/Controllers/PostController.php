<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\PostTranslation;
use Illuminate\Support\Facades\DB;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth('sanctum')->id() ?? 0;
        $lang = $request->query('lang', 'ru');
        $search = $request->query('search');
        
        $query = Post::with(['user', 'image', 'translations'])
            ->withCount('likes')
            ->withExists(['likes as liked_by_me' => function ($q) use ($userId) {
                $q->where('user_id', $userId);
            }]);

        if ($search) {
            $query->where('title', 'like', "%{$search}%");
        }

        $posts = $query->orderBy('id', 'desc')->get();

        $posts->each(function ($post) use ($lang) {
            $translation = $post->translations->where('locale', $lang)->first();
            
            $post->author = $post->user ? $post->user->name : 'Unknown';
            $post->author_role = $post->user ? $post->user->role : 'user';
            $post->image_url = $post->image ? '/uploads/' . $post->image->file_name : null;
            $post->likes = $post->likes_count;
            $post->liked_by_me = (bool) $post->liked_by_me;
            
            $post->title = $translation ? $translation->title : $post->title;
            $post->content = $translation ? $translation->content : $post->content;
            
            unset($post->user, $post->image, $post->likes_count, $post->translations);
        });

        return response()->json(['success' => true, 'data' => $posts]);
    }

    public function show(Request $request, $id)
    {
        $userId = auth('sanctum')->id() ?? 0;
        $lang = $request->query('lang', 'ru');
        
        $post = Post::with(['user', 'image', 'translations'])
            ->withCount('likes')
            ->withExists(['likes as liked_by_me' => function ($q) use ($userId) {
                $q->where('user_id', $userId);
            }])->find($id);

        if (!$post) return response()->json(['success' => false, 'message' => 'Post not found'], 404);

        $translation = $post->translations->where('locale', $lang)->first();

        $post->author = $post->user ? $post->user->name : 'Unknown';
        $post->author_role = $post->user ? $post->user->role : 'user';
        $post->image_url = $post->image ? '/uploads/' . $post->image->file_name : null;
        $post->likes = $post->likes_count;
        $post->liked_by_me = (bool) $post->liked_by_me;
        
        $post->title = $translation ? $translation->title : $post->title;
        $post->content = $translation ? $translation->content : $post->content;
        
        unset($post->user, $post->image, $post->likes_count, $post->translations);

        return response()->json(['success' => true, 'data' => $post]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'translations' => 'required|array',
            'translations.*.locale' => 'required|string|max:5',
            'translations.*.title' => 'required|string|max:255',
            'translations.*.content' => 'required|string|max:5000',
        ]);

        try {
            DB::beginTransaction();
            
            $mainTranslation = $request->translations[0];
            
            $post = Post::create([
                'title' => $mainTranslation['title'],
                'content' => $mainTranslation['content'],
                'user_id' => auth()->id()
            ]);

            foreach ($request->translations as $trans) {
                PostTranslation::create([
                    'post_id' => $post->id,
                    'locale' => $trans['locale'],
                    'title' => $trans['title'],
                    'content' => $trans['content'],
                ]);
            }

            DB::commit();
            return response()->json(['success' => true, 'data' => $post]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $post = Post::find($id);
        if (!$post) return response()->json(['success' => false, 'message' => 'Пост не найден'], 404);
        
        $this->authorize('update', $post);
        
        $request->validate([
            'translations' => 'required|array',
            'translations.*.locale' => 'required|string|max:5',
            'translations.*.title' => 'required|string|max:255',
            'translations.*.content' => 'required|string|max:5000',
        ]);

        try {
            DB::beginTransaction();
            
            $mainTranslation = $request->translations[0];
            $post->update([
                'title' => $mainTranslation['title'],
                'content' => $mainTranslation['content']
            ]);

            foreach ($request->translations as $trans) {
                PostTranslation::updateOrCreate(
                    ['post_id' => $post->id, 'locale' => $trans['locale']],
                    ['title' => $trans['title'], 'content' => $trans['content']]
                );
            }

            DB::commit();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $post = Post::find($id);
        if (!$post) return response()->json(['success' => false, 'message' => 'Пост не найден'], 404);
        
        $this->authorize('delete', $post);
        
        $post->delete();
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

            $post = Post::find($request->post_id);
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