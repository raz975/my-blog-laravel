<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LanguageController extends Controller
{
    public function index()
    {
        // Берем все языки из таблицы languages
        $languages = DB::table('languages')->get();

        return response()->json([
            'success' => true,
            'data' => $languages
        ]);
    }
}