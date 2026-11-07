<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Post;

class PostPolicy
{
    public function update(User $user, Post $post)
    {
        return $user->id === $post->user_id;
    }

    public function delete(User $user, Post $post)
    {
        if ($user->id === $post->user_id) return true;
        
        if ($user->role === 'superadmin') return true;

        if ($user->role === 'admin') {
            $postAuthor = User::find($post->user_id);
            return $postAuthor && $postAuthor->role === 'user';
        }

        return false;
    }
}