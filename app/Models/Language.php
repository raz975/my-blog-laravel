<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Language extends Model
{
    use HasFactory;

public $timestamps = false;

    protected $fillable = [
        'code',
        'name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Переводы постов
    public function postTranslations()
    {
        return $this->hasMany(PostTranslation::class);
    }

    // Переводы меню
    public function menuItemTranslations()
    {
        return $this->hasMany(MenuItemTranslation::class);
    }
}