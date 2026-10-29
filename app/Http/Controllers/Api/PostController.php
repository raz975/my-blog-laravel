<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostLike;
use App\Models\PostImage;
use App\Models\PostTranslation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    /**
     * Список постов (с поиском, лайками, картинкой)
     * GET /api/posts?lang=ru&search=...&per_page=10&page=1
     */
    public function index(Request $request)
    {
        $lang = $request->query('lang', 'ru');
        $search = $request->query('search', '');
        $perPage = (int)$request->query('per_page', 20);

        // Язык
        $language = \App\Models\Language::where('code', $lang)->first()
            ?? \App\Models\Language::where('is_active', 1)->first();

        $userId = $request->user()?->id ?? 0;

        $query = Post::with(['user', 'image'])
            ->withCount('likes')
            ->withCount(['likes as liked_by_me' => function ($q) use ($userId) {
                $q->where('user_id', $userId);
            }]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('content', 'LIKE', "%{$search}%");
            });
        }

        $query->orderBy('id', 'desc');

        $posts = $query->paginate($perPage);

        // Подменяем title/content переводами (если есть)
        if ($language) {
            $posts->getCollection()->transform(function ($post) use ($language) {
                $translation = PostTranslation::where('post_id', $post->id)
                    ->where('language_id', $language->id)
                    ->first();

                $post->title = $translation->title ?? $post->title;
                $post->content = $translation->content ?? $post->content;

                return $post;
            });
        }

        return response()->json([
            'success' => true,
            'posts' => $posts->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'content' => $post->content,
                    'user_id' => $post->user_id,
                    'author' => $post->user->name ?? 'Unknown',
                    'created_at' => $post->created_at,
                    'likes' => (int)$post->likes_count,
                    'liked_by_me' => (int)$post->liked_by_me,
                    'image_url' => $post->image ? '/uploads/' . $post->image->file_name : null,
                ];
            }),
            'pagination' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    /**
     * Один пост
     * GET /api/posts/{id}?lang=ru
     */
    public function show(Request $request, $id)
    {
        $lang = $request->query('lang', 'ru');
        $language = \App\Models\Language::where('code', $lang)->first()
            ?? \App\Models\Language::where('is_active', 1)->first();

        $post = Post::with(['user', 'image'])->find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'error' => 'Post not found',
            ], 404);
        }

        // Перевод
        if ($language) {
            $translation = PostTranslation::where('post_id', $post->id)
                ->where('language_id', $language->id)
                ->first();

            $post->title = $translation->title ?? $post->title;
            $post->content = $translation->content ?? $post->content;
        }

        $likes = PostLike::where('post_id', $post->id)->count();
        $userId = $request->user()?->id ?? 0;
        $likedByMe = PostLike::where('post_id', $post->id)->where('user_id', $userId)->exists();

        return response()->json([
            'success' => true,
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'user_id' => $post->user_id,
                'author' => $post->user->name ?? 'Unknown',
                'created_at' => $post->created_at,
                'likes' => $likes,
                'liked_by_me' => $likedByMe ? 1 : 0,
                'image_url' => $post->image ? '/uploads/' . $post->image->file_name : null,
            ],
        ]);
    }

    /**
     * Создание поста
     * POST /api/posts
     * Body: { title, content, translations: {ru: {...}, en: {...}} }
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'translations' => 'nullable|array',
        ]);

        $post = Post::create([
            'title' => $data['title'],
            'content' => $data['content'],
            'user_id' => $user->id,
        ]);

        // Переводы
        if (!empty($data['translations'])) {
            foreach ($data['translations'] as $code => $tr) {
                $lang = \App\Models\Language::where('code', $code)->first();
                if (!$lang) continue;

                $tTitle = trim($tr['title'] ?? '');
                $tContent = trim($tr['content'] ?? '');
                if (!$tTitle || !$tContent) continue;

                PostTranslation::create([
                    'post_id' => $post->id,
                    'language_id' => $lang->id,
                    'title' => $tTitle,
                    'content' => $tContent,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Post created',
            'id' => $post->id,
        ], 201);
    }

    /**
     * Обновление поста
     * PUT /api/posts/{id}
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $post = Post::find($id);

        if (!$post) {
            return response()->json(['success' => false, 'error' => 'Post not found'], 404);
        }

        $isOwner = $post->user_id === $user->id;
        $isAdmin = $user->role === 'admin';

        if (!$isOwner && !$isAdmin) {
            return response()->json(['success' => false, 'error' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'translations' => 'nullable|array',
        ]);

        $post->update([
            'title' => $data['title'],
            'content' => $data['content'],
        ]);

        if (!empty($data['translations'])) {
            foreach ($data['translations'] as $code => $tr) {
                $lang = \App\Models\Language::where('code', $code)->first();
                if (!$lang) continue;

                $tTitle = trim($tr['title'] ?? '');
                $tContent = trim($tr['content'] ?? '');
                if (!$tTitle || !$tContent) continue;

                PostTranslation::updateOrCreate(
                    ['post_id' => $post->id, 'language_id' => $lang->id],
                    ['title' => $tTitle, 'content' => $tContent]
                );
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Post updated',
        ]);
    }

    /**
     * Удаление
     * DELETE /api/posts/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $post = Post::find($id);

        if (!$post) {
            return response()->json(['success' => false, 'error' => 'Post not found'], 404);
        }

        $isOwner = $post->user_id === $user->id;
        $isAdmin = $user->role === 'admin';

        if (!$isOwner && !$isAdmin) {
            return response()->json(['success' => false, 'error' => 'Forbidden'], 403);
        }

        // Удалить картинку с диска
        if ($post->image) {
            $filePath = public_path('uploads/' . $post->image->file_name);
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post deleted',
        ]);
    }

    /**
     * Лайк/анлайк поста
     * POST /api/posts/{id}/like
     */
    public function like(Request $request, $id)
    {
        $user = $request->user();
        $post = Post::find($id);

        if (!$post) {
            return response()->json(['success' => false, 'error' => 'Post not found'], 404);
        }

        $existing = PostLike::where('post_id', $id)->where('user_id', $user->id)->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
        } else {
            PostLike::create(['post_id' => $id, 'user_id' => $user->id]);
            $liked = true;
        }

        $count = PostLike::where('post_id', $id)->count();

        return response()->json([
            'success' => true,
            'liked' => $liked,
            'likes' => $count,
        ]);
    }
}