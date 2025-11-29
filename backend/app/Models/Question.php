<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    protected $fillable = ['poll_id', 'question', 'emoji', 'options', 'creator_id', 'target_school', 'active'];
    protected $casts = ['options' => 'array', 'active' => 'boolean'];

    public function poll(): BelongsTo
    {
        return $this->belongsTo(Poll::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(QuestionVote::class);
    }
}
