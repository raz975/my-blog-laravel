<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ImageController extends Controller
{
    public function show($postId)
    {
        // Ищем картинку в таблице post_images
        $image = DB::table('post_images')->where('post_id', $postId)->first();

        if (!$image) {
            return response()->json(['success' => false, 'message' => 'No image record'], 404);
        }

        // Берем имя файла из колонки file_name (как на скриншоте phpMyAdmin)
        $fileName = $image->file_name;

        return response()->json([
            'success' => true,
            'image' => [
                // Формируем путь к файлу. 
                // Если файлы лежат в public/uploads, путь будет /uploads/file_name
                // Если в storage/app/public, путь будет /storage/file_name
                'url' => '/storage/' . $fileName 
            ]
        ]);
    }
}