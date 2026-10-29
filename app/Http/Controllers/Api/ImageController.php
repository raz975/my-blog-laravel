<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostImage;
use Illuminate\Http\Request;

class ImageController extends Controller
{
    /**
     * Загрузка картинки поста (1 картинка на пост)
     * POST /api/images/upload (multipart/form-data)
     * Fields: post_id, image (file)
     */
    public function upload(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'post_id' => 'required|integer|exists:posts,id',
            'image' => 'required|image|mimes:jpeg,png,gif,webp|max:5120',
        ]);

        $post = Post::find($data['post_id']);

        $isOwner = $post->user_id === $user->id;
        $isAdmin = $user->role === 'admin';

        if (!$isOwner && !$isAdmin) {
            return response()->json(['success' => false, 'error' => 'Forbidden'], 403);
        }

        $file = $request->file('image');
        $ext = $file->getClientOriginalExtension();
        $fileName = 'post_' . $post->id . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;

        // Сохраняем в public/uploads
        $file->move(public_path('uploads'), $fileName);

        // Удаляем старую картинку (если есть)
        $oldImage = PostImage::where('post_id', $post->id)->first();
        if ($oldImage) {
            $oldPath = public_path('uploads/' . $oldImage->file_name);
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
            $oldImage->delete();
        }

        // Сохраняем в БД
        $image = PostImage::create([
            'post_id' => $post->id,
            'file_name' => $fileName,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Image uploaded',
            'image' => [
                'id' => $image->id,
                'file_name' => $fileName,
                'url' => '/uploads/' . $fileName,
            ],
        ]);
    }

    /**
     * Получить картинку поста
     * GET /api/images/{postId}
     */
    public function get($postId)
    {
        $image = PostImage::where('post_id', $postId)
            ->orderBy('id', 'desc')
            ->first();

        if (!$image) {
            return response()->json(['success' => true, 'image' => null]);
        }

        return response()->json([
            'success' => true,
            'image' => [
                'id' => $image->id,
                'file_name' => $image->file_name,
                'url' => '/uploads/' . $image->file_name,
                'mime_type' => $image->mime_type,
                'file_size' => (int)$image->file_size,
            ],
        ]);
    }

    /**
     * Удалить картинку поста
     * DELETE /api/images/{postId}
     */
    public function delete(Request $request, $postId)
    {
        $user = $request->user();
        $post = Post::find($postId);

        if (!$post) {
            return response()->json(['success' => false, 'error' => 'Post not found'], 404);
        }

        $isOwner = $post->user_id === $user->id;
        $isAdmin = $user->role === 'admin';

        if (!$isOwner && !$isAdmin) {
            return response()->json(['success' => false, 'error' => 'Forbidden'], 403);
        }

        $images = PostImage::where('post_id', $postId)->get();

        foreach ($images as $img) {
            $path = public_path('uploads/' . $img->file_name);
            if (file_exists($path)) {
                unlink($path);
            }
            $img->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Image(s) deleted',
        ]);
    }
}