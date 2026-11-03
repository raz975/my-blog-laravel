<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;
    public $timestamps = false; 
    protected $fillable = ['title', 'content', 'user_id'];

    public function user() { return $this->belongsTo(User::class); }
    public function comments() { return $this->hasMany(Comment::class); }
    public function image() { return $this->hasOne(PostImage::class); }
    public function likes() { return $this->hasMany(PostLike::class); }
}