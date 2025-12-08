<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShareLinkStyle extends Model
{
    protected $fillable = [
        'slug',
        'question',
        'premium',
        'color',
        'bg',
    ];

    protected $casts = [
        'premium' => 'boolean',
    ];
}
