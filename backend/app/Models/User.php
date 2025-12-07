<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'sex',
        'profile_photo',
        'is_subscribed',
        'hajp_coins',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $appends = ['coins'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'hajp_coins' => 'integer',
        ];
    }

    public function getCoinsAttribute(): int
    {
        return (int) ($this->attributes['hajp_coins'] ?? 0);
    }

    public function setCoinsAttribute($value): void
    {
        $this->attributes['hajp_coins'] = max(0, (int) $value);
    }

    public function polls()
    {
        return $this->hasMany(Poll::class, 'creator_id');
    }

    public function anonymousInbox()
    {
        return $this->hasOne(AnonymousInbox::class);
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }

    public function rooms()
    {
        return $this->belongsToMany(Room::class, 'room_members');
    }

    public function roomMemberships()
    {
        return $this->hasMany(RoomMember::class);
    }

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }

    public function cashouts()
    {
        return $this->hasMany(CashoutHistory::class);
    }
}
