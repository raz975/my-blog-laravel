<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'user_id',
        'content',
    ];

    // Пост
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    // Автор
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Лайки
    public function likes()
    {
        return $this->hasMany(CommentLike::class);
    }
}