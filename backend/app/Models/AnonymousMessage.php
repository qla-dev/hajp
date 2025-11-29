<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnonymousMessage extends Model
{
    protected $fillable = ['inbox_id','message','metadata'];
    protected $casts = ['metadata' => 'array'];

    public function inbox(): BelongsTo
    {
        return $this->belongsTo(AnonymousInbox::class, 'inbox_id');
    }
}
