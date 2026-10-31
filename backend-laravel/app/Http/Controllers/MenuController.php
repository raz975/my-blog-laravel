<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MenuController extends Controller
{
    public function index()
    {
        $menu = DB::table('menu_items')->orderBy('sort_order')->get();
        return response()->json(['success' => true, 'data' => $menu]);
    }

    public function store(Request $request)
    {
        // React может присылать 'title', а в базе колонка 'name'
        $id = DB::table('menu_items')->insertGetId([
            'name' => $request->title ?? $request->name, 
            'url' => $request->url,
            'parent_id' => $request->parent_id ?: null,
            'user_id' => auth()->id(), 
            'sort_order' => 0,
            'is_active' => 1,
        ]);

        $item = DB::table('menu_items')->find($id);
        return response()->json(['success' => true, 'data' => $item]);
    }

    public function destroy($id)
    {
        DB::table('menu_items')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}