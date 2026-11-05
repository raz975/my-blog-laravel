<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function languages()
    {
        return response()->json(['success' => true, 'data' => DB::table('languages')->get()]);
    }

    public function createLanguage(Request $request)
    {
        $request->validate(['code' => 'required|string|max:5', 'name' => 'required|string|max:50']);
        $id = DB::table('languages')->insertGetId(['code' => $request->code, 'name' => $request->name, 'is_active' => $request->is_active ?? 1]);
        return response()->json(['success' => true, 'data' => DB::table('languages')->find($id)]);
    }

    public function updateLanguage(Request $request, $id)
    {
        $request->validate(['code' => 'required|string|max:5', 'name' => 'required|string|max:50']);
        DB::table('languages')->where('id', $id)->update(['code' => $request->code, 'name' => $request->name, 'is_active' => $request->is_active ?? 1]);
        return response()->json(['success' => true]);
    }

    public function deleteLanguage($id)
    {
        DB::table('languages')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    public function users()
    {
        return response()->json(['success' => true, 'data' => DB::table('users')->get()]);
    }

    public function blockUser(Request $request, $id)
    {
        $request->validate(['is_blocked' => 'required|boolean']);
        
        $target = DB::table('users')->find($id);
        if ($target && $target->role === 'superadmin' && auth()->id() != $id) {
            return response()->json(['success' => false, 'message' => 'Нельзя блокировать супер-админа.'], 403);
        }
        
        DB::table('users')->where('id', $id)->update(['is_blocked' => $request->is_blocked]);
        return response()->json(['success' => true]);
    }

    public function changeRole(Request $request, $id)
    {
        if (auth()->user()->role !== 'superadmin') {
            return response()->json(['success' => false, 'message' => 'Только супер-админ может менять роли.'], 403);
        }

        $request->validate(['role' => 'required|string|in:user,admin']);
        DB::table('users')->where('id', $id)->update(['role' => $request->role]);
        return response()->json(['success' => true]);
    }

    public function deleteUser($id)
    {
        if (auth()->id() == $id) {
            return response()->json(['success' => false, 'message' => 'Нельзя удалить себя.'], 400);
        }
        
        $target = DB::table('users')->find($id);
        if ($target && $target->role === 'superadmin') {
            return response()->json(['success' => false, 'message' => 'Нельзя удалить супер-админа.'], 403);
        }
        
        DB::table('users')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}