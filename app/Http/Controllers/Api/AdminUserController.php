<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * Проверка, что юзер — админ
     */
    private function requireAdmin(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'error' => 'Forbidden: admin only',
            ], 403);
        }
        return null;
    }

    /**
     * Список всех юзеров
     * GET /api/admin/users
     */
    public function index(Request $request)
    {
        if ($err = $this->requireAdmin($request)) return $err;

        $users = User::orderBy('id', 'asc')
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role,
                    'is_blocked' => (int)$u->is_blocked,
                    'created_at' => $u->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'users' => $users,
            'current_admin_id' => $request->user()->id,
        ]);
    }

    /**
     * Заблокировать/разблокировать
     * PUT /api/admin/users/{id}/block
     * Body: { is_blocked: 0|1 }
     */
    public function block(Request $request, $id)
    {
        if ($err = $this->requireAdmin($request)) return $err;

        $target = User::find($id);
        if (!$target) {
            return response()->json(['success' => false, 'error' => 'User not found'], 404);
        }

        if ($target->id === $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'You cannot block yourself'], 403);
        }

        $data = $request->validate([
            'is_blocked' => 'required|in:0,1',
        ]);

        $target->update(['is_blocked' => (bool)$data['is_blocked']]);

        return response()->json([
            'success' => true,
            'message' => $data['is_blocked'] ? 'User blocked' : 'User unblocked',
            'is_blocked' => (int)$target->is_blocked,
        ]);
    }

    /**
     * Сменить роль
     * PUT /api/admin/users/{id}/role
     * Body: { role: "user"|"admin" }
     */
    public function changeRole(Request $request, $id)
    {
        if ($err = $this->requireAdmin($request)) return $err;

        $target = User::find($id);
        if (!$target) {
            return response()->json(['success' => false, 'error' => 'User not found'], 404);
        }

        if ($target->id === $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'You cannot change your own role'], 403);
        }

        $data = $request->validate([
            'role' => 'required|in:user,admin',
        ]);

        $target->update(['role' => $data['role']]);

        return response()->json([
            'success' => true,
            'message' => 'Role changed to ' . $data['role'],
            'role' => $data['role'],
        ]);
    }

    /**
     * Удалить юзера
     * DELETE /api/admin/users/{id}
     */
    public function destroy(Request $request, $id)
    {
        if ($err = $this->requireAdmin($request)) return $err;

        $target = User::find($id);
        if (!$target) {
            return response()->json(['success' => false, 'error' => 'User not found'], 404);
        }

        if ($target->id === $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'You cannot delete yourself'], 403);
        }

        $target->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted',
        ]);
    }
}