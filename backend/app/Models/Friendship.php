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
