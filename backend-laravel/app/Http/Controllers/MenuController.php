<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $lang = $request->query('lang', 'ru');
        
        $menuItems = DB::table('menu_items')->orderBy('sort_order')->get();
        
        foreach ($menuItems as $item) {
            $translation = DB::table('menu_item_translations')
                ->where('menu_item_id', $item->id)
                ->where('locale', $lang)
                ->first();
            
            if ($translation) {
                $item->name = $translation->name;
            }
        }

        return response()->json(['success' => true, 'data' => $menuItems]);
    }

    public function store(Request $request)
    {
        try {
            DB::beginTransaction();
            
            $mainName = $request->translations['ru'] ?? $request->name ?? '';
            
            $id = DB::table('menu_items')->insertGetId([
                'name' => $mainName,
                'url' => $request->url,
                'parent_id' => $request->parent_id ?: null,
                'user_id' => auth()->id(),
                'sort_order' => 0,
                'is_active' => 1,
            ]);

            if ($request->has('translations')) {
                foreach ($request->translations as $locale => $name) {
                    if (!empty($name)) {
                        DB::table('menu_item_translations')->insert([
                            'menu_item_id' => $id,
                            'locale' => $locale,
                            'name' => $name,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }

            DB::commit();
            return response()->json(['success' => true, 'data' => DB::table('menu_items')->find($id)]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();
            
            $mainName = $request->translations['ru'] ?? $request->name ?? '';

            DB::table('menu_items')->where('id', $id)->update([
                'name' => $mainName,
                'url' => $request->url,
                'parent_id' => $request->parent_id ?: null,
            ]);

            if ($request->has('translations')) {
                foreach ($request->translations as $locale => $name) {
                    if (!empty($name)) {
                        DB::table('menu_item_translations')->updateOrInsert(
                            ['menu_item_id' => $id, 'locale' => $locale],
                            ['name' => $name, 'updated_at' => now()]
                        );
                    }
                }
            }

            DB::commit();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function reorder(Request $request)
    {
        foreach ($request->input('items', []) as $item) {
            DB::table('menu_items')->where('id', $item['id'])->update([
                'sort_order' => $item['sort_order'],
                'parent_id' => $item['parent_id'] ?: null
            ]);
        }
        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        DB::table('menu_items')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}