<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashoutHistory extends Model
{
    protected $table = 'cashout_history';
    protected $fillable = ['user_id', 'poll_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function poll(): BelongsTo
    {
        return $this->belongsTo(Poll::class);
    }
}
