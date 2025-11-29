<?php

namespace App\Models;

use App\Models\User;
use App\Models\Vote;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    protected $fillable = ['poll_id', 'question', 'emoji', 'creator_id'];

    public function poll(): BelongsTo
    {
        return $this->belongsTo(Poll::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }

    public function generateOptions(int $limit = 4): array
    {
        $this->loadMissing('poll.room.users');

        $roomUsers = $this->poll?->room?->users();
        $query = $roomUsers && $roomUsers->exists() ? $roomUsers : User::query();

        return $query->inRandomOrder()
            ->limit($limit)
            ->get(['users.id', 'users.name'])
            ->map(fn(User $user) => [
                'user_id' => $user->id,
                'name' => $user->name,
            ])
            ->toArray();
    }
}
