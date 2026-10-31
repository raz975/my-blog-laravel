<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Валидация данных
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // 2. Попытка входа
        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            // Возвращаем данные пользователя, чтобы React знал, что вход успешен
            return response()->json([
                'user' => Auth::user(),
                'message' => 'Logged in successfully'
            ]);
        }

        // 3. Если пароль неверный - возвращаем ошибку
        throw ValidationException::withMessages([
            'email' => ['The provided credentials do not match our records.'],
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    }
}