<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostImage extends Model
{
    public $timestamps = false;
    protected $fillable = ['post_id', 'file_name', 'created_at'];
}