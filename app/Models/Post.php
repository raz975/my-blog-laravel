<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'user_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Автор поста
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Комментарии
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    // Лайки
    public function likes()
    {
        return $this->hasMany(PostLike::class);
    }

    // Картинка (одна)
    public function image()
    {
        return $this->hasOne(PostImage::class);
    }

    // Переводы
    public function translations()
    {
        return $this->hasMany(PostTranslation::class);
    }
}