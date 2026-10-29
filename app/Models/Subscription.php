<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'follower_id',
        'following_id',
    ];

    // Кто подписался
    public function follower()
    {
        return $this->belongsTo(User::class, 'follower_id');
    }

    // На кого подписался
    public function following()
    {
        return $this->belongsTo(User::class, 'following_id');
    }
}