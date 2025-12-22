<?php

namespace App\Models;

use App\Models\Poll;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $fillable = ['name', 'type', 'is_18_over', 'cover_url', 'tagline', 'description', 'is_private', 'code'];

    public function members(): HasMany
    {
        return $this->hasMany(RoomMember::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'room_members');
    }

    public function polls()
    {
        $vibes = (array) ($this->vibes ?? []);

        return Poll::query()->when(!empty($vibes), function ($query) use ($vibes) {
            $query->where(function ($subQuery) use ($vibes) {
                foreach ($vibes as $vibe) {
                    $subQuery->orWhereJsonContains('vibes', $vibe);
                }
            });
        });
    }

}
