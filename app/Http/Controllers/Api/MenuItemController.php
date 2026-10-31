<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\MenuItemTranslation;
use App\Models\Language;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    private function requireAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'error' => 'Forbidden: admin only'], 403);
        }
        return null;
    }

    /**
     * Список меню (с переводами, деревом)
     * GET /api/menu?lang=ru
     */
    public function index(Request $request)
    {
        $lang = $request->query('lang', 'ru');
        $language = Language::where('code', $lang)->first()
            ?? Language::where('is_active', 1)->first();

        $items = MenuItem::where('is_active', 1)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        // Подгружаем переводы
        if ($language) {
            $translations = MenuItemTranslation::where('language_id', $language->id)
                ->pluck('name', 'menu_item_id');

            foreach ($items as $item) {
                $item->display_name = $translations[$item->id] ?? $item->name;
            }
        } else {
            foreach ($items as $item) {
                $item->display_name = $item->name;
            }
        }

        // Дерево
        $tree = $this->buildTree($items->toArray());

        return response()->json([
            'success' => true,
            'menu' => $tree,
            'language' => $language ? $language->code : 'ru',
        ]);
    }

    /**
     * Все меню (для админки — плоский список)
     * GET /api/admin/menu
     */
    public function adminIndex(Request $request)
    {
        if ($err = $this->requireAdmin($request)) return $err;

        $items = MenuItem::orderBy('sort_order')->orderBy('id')->get();

        return response()->json([
            'success' => true,
            'items' => $items,
        ]);
    }

    /**
     * Создать пункт меню
     * POST /api/admin/menu
     * Body: { name, parent_id, url, translations: {ru: "...", en: "..."} }
     */
    public function store(Request $request)
    {
        if ($err = $this->requireAdmin($request)) return $err;

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|integer|exists:menu_items,id',
            'url' => 'nullable|string|max:255',
            'translations' => 'nullable|array',
        ]);

        $maxSort = MenuItem::max('sort_order') ?? 0;

        $item = MenuItem::create([
            'name' => $data['name'],
            'parent_id' => $data['parent_id'] ?? null,
            'url' => $data['url'] ?? null,
            'user_id' => $request->user()->id,
            'sort_order' => $maxSort + 1,
            'is_active' => true,
        ]);

        // Переводы
        if (!empty($data['translations'])) {
            foreach ($data['translations'] as $code => $transName) {
                $lang = Language::where('code', $code)->first();
                if (!$lang || !$transName) continue;

                MenuItemTranslation::updateOrCreate(
                    ['menu_item_id' => $item->id, 'language_id' => $lang->id],
                    ['name' => $transName]
                );
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Menu item created',
            'id' => $item->id,
        ], 201);
    }

    /**
     * Обновить пункт меню
     * PUT /api/admin/menu/{id}
     */
    public function update(Request $request, $id)
    {
        if ($err = $this->requireAdmin($request)) return $err;

        $item = MenuItem::find($id);
        if (!$item) {
            return response()->json(['success' => false, 'error' => 'Menu item not found'], 404);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|integer|exists:menu_items,id',
            'url' => 'nullable|string|max:255',
            'translations' => 'nullable|array',
        ]);

        if ($data['parent_id'] == $id) {
            return response()->json(['success' => false, 'error' => 'Item cannot be its own parent'], 400);
        }

        $item->update([
            'name' => $data['name'],
            'parent_id' => $data['parent_id'] ?? null,
            'url' => $data['url'] ?? null,
        ]);

        // Переводы
        if (!empty($data['translations'])) {
            foreach ($data['translations'] as $code => $transName) {
                $lang = Language::where('code', $code)->first();
                if (!$lang || !$transName) continue;

                MenuItemTranslation::updateOrCreate(
                    ['menu_item_id' => $item->id, 'language_id' => $lang->id],
                    ['name' => $transName]
                );
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Menu item updated',
        ]);
    }

    /**
     * Удалить
     * DELETE /api/admin/menu/{id}
     */
    public function destroy(Request $request, $id)
    {
        if ($err = $this->requireAdmin($request)) return $err;

        $item = MenuItem::find($id);
        if (!$item) {
            return response()->json(['success' => false, 'error' => 'Menu item not found'], 404);
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu item deleted',
        ]);
    }

    /**
     * Сохранить порядок (drag&drop)
     * PUT /api/admin/menu/reorder
     * Body: { items: [{ id, sort_order, parent_id }, ...] }
     */
    public function reorder(Request $request)
    {
        if ($err = $this->requireAdmin($request)) return $err;

        $data = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer',
            'items.*.sort_order' => 'required|integer',
            'items.*.parent_id' => 'nullable|integer',
        ]);

        foreach ($data['items'] as $it) {
            MenuItem::where('id', $it['id'])->update([
                'sort_order' => $it['sort_order'],
                'parent_id' => $it['parent_id'] ?? null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Menu order saved',
        ]);
    }

    /**
     * Построить дерево
     */
    private function buildTree(array $items, $parentId = null)
    {
        $branch = [];
        foreach ($items as $item) {
            if ($item['parent_id'] == $parentId) {
                $children = $this->buildTree($items, $item['id']);
                if (!empty($children)) {
                    $item['children'] = $children;
                } else {
                    $item['children'] = [];
                }
                $branch[] = $item;
            }
        }
        return $branch;
    }
}