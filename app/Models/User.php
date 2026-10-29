<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public $timestamps = false;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_blocked',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_blocked' => 'boolean',
    ];

    // === СВЯЗИ ===

    // Посты
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    // Комментарии
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    // Лайки постов
    public function postLikes()
    {
        return $this->hasMany(PostLike::class);
    }

    // Лайки комментариев
    public function commentLikes()
    {
        return $this->hasMany(CommentLike::class);
    }

    // На кого я подписан
    public function following()
    {
        return $this->belongsToMany(
            User::class,
            'subscriptions',
            'follower_id',
            'following_id'
        );
    }

    // Кто подписан на меня
    public function followers()
    {
        return $this->belongsToMany(
            User::class,
            'subscriptions',
            'following_id',
            'follower_id'
        );
    }
}