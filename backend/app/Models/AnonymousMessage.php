<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnonymousMessage extends Model
{
    protected $fillable = ['user_id', 'message', 'style_id'];

    public function style(): BelongsTo
    {
        return $this->belongsTo(ShareLinkStyle::class, 'style_id');
    }
}
