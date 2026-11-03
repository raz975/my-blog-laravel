# Blog Platform — React + Laravel + MySQL

Фуллстек-приложение для ведения блога с авторизацией, админ-панелью и мультиязычностью.

## 📋 Стек технологий
- **Backend:** Laravel 10, Laravel Sanctum, MySQL
- **Frontend:** React 18 (Vite), React Router, Axios

## ✨ Функционал
- Авторизация (регистрация, вход, выход, смена пароля)
- Посты (создание, редактирование, удаление, загрузка картинок)
- Лайки и комментарии
- Профили пользователей с подписками
- Админ-панель (управление пользователями, языками, меню)
- Мультиязычность (RU / EN / HY)
- Светлая и тёмная темы

## 🚀 Запуск проекта

### Backend
```bash
cd backend-laravel
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve