<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Post;
use App\Models\Comment;
use App\Policies\PostPolicy;
use App\Policies\CommentPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Post::class => PostPolicy::class,
        Comment::class => CommentPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        Gate::define('manage-users', function ($user) {
            return in_array($user->role, ['admin', 'superadmin']);
        });

        Gate::define('manage-languages', function ($user) {
            return in_array($user->role, ['admin', 'superadmin']);
        });

        Gate::define('manage-menu', function ($user) {
            return in_array($user->role, ['admin', 'superadmin']);
        });

        Gate::define('change-roles', function ($user) {
            return $user->role === 'superadmin';
        });

        Gate::define('block-users', function ($user) {
            return in_array($user->role, ['admin', 'superadmin']);
        });

        Gate::define('delete-users', function ($user) {
            return $user->role === 'superadmin';
        });
    }
}