<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ImageController extends Controller
{
    public function show($postId)
    {
        $image = DB::table('post_images')->where('post_id', $postId)->first();

        if (!$image) {
            return response()->json(['success' => false, 'message' => 'No image record'], 404);
        }

        $fileName = $image->file_name;

        return response()->json([
            'success' => true,
            'image' => [
                'url' => '/storage/' . $fileName 
            ]
        ]);
    }
}