<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Poll extends Model
{
    protected $fillable = ['room_id', 'status'];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }
}
