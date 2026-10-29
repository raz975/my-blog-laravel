<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'parent_id',
        'url',
        'user_id',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Родитель (parent)
    public function parent()
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }

    // Дочерние пункты (children)
    public function children()
    {
        return $this->hasMany(MenuItem::class, 'parent_id');
    }

    // Автор (кто создал)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Переводы
    public function translations()
    {
        return $this->hasMany(MenuItemTranslation::class);
    }
}