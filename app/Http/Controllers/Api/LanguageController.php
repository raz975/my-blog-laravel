<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Language;
use Illuminate\Http\Request;

class LanguageController extends Controller
{
    /**
     * Публичный список языков (для селектора)
     * GET /api/languages
     */
    public function list()
    {
        $languages = Language::orderBy('id', 'asc')->get()->map(function ($l) {
            return [
                'id' => $l->id,
                'code' => $l->code,
                'name' => $l->name,
                'is_active' => (int)$l->is_active,
            ];
        });

        return response()->json([
            'success' => true,
            'languages' => $languages,
        ]);
    }

    /**
     * Все языки (для админа)
     * GET /api/admin/languages
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'error' => 'Forbidden'], 403);
        }

        $languages = Language::orderBy('id', 'asc')->get()->map(function ($l) {
            return [
                'id' => $l->id,
                'code' => $l->code,
                'name' => $l->name,
                'is_active' => (int)$l->is_active,
            ];
        });

        return response()->json([
            'success' => true,
            'languages' => $languages,
        ]);
    }

    /**
     * Создать язык
     * POST /api/admin/languages
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'error' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'code' => 'required|string|min:2|max:10|regex:/^[a-z]{2,5}$/|unique:languages,code',
            'name' => 'required|string|max:100',
        ]);

        $lang = Language::create([
            'code' => $data['code'],
            'name' => $data['name'],
            'is_active' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Language created',
            'id' => $lang->id,
        ], 201);
    }

    /**
     * Обновить язык
     * PUT /api/admin/languages/{id}
     */
    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'error' => 'Forbidden'], 403);
        }

        $lang = Language::find($id);
        if (!$lang) {
            return response()->json(['success' => false, 'error' => 'Language not found'], 404);
        }

        $data = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $lang->update(['name' => $data['name']]);

        return response()->json([
            'success' => true,
            'message' => 'Language updated',
        ]);
    }

    /**
     * Удалить язык
     * DELETE /api/admin/languages/{id}
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'error' => 'Forbidden'], 403);
        }

        $lang = Language::find($id);
        if (!$lang) {
            return response()->json(['success' => false, 'error' => 'Language not found'], 404);
        }

        if ($lang->is_active) {
            return response()->json(['success' => false, 'error' => 'Cannot delete active language'], 403);
        }

        $count = Language::count();
        if ($count <= 1) {
            return response()->json(['success' => false, 'error' => 'Cannot delete the last language'], 403);
        }

        $lang->delete();

        return response()->json([
            'success' => true,
            'message' => 'Language deleted',
        ]);
    }

    /**
     * Сделать активным
     * PUT /api/admin/languages/{id}/set-active
     */
    public function setActive(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'error' => 'Forbidden'], 403);
        }

        $lang = Language::find($id);
        if (!$lang) {
            return response()->json(['success' => false, 'error' => 'Language not found'], 404);
        }

        // Снять активность со всех
        Language::where('is_active', 1)->update(['is_active' => false]);

        // Установить на нужный
        $lang->update(['is_active' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Active language set',
        ]);
    }
}