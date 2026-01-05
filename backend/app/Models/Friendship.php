<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Friendship extends Model
{
    protected $table = 'friendships';

    protected $fillable = [
        'auth_user_id',
        'user_id',
        'approved',
        'blocked',
        'reported',
    ];

    protected $casts = [
        'approved' => 'boolean',
        'blocked' => 'boolean',
    ];

    protected $attributes = [
        'blocked' => 0,
        'reported' => '0',
    ];

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'auth_user_id');
    }

    public function friend(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
