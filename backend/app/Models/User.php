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
        'email',
        'password',
        'school',
        'grade',
        'profile_photo',
        'is_subscribed',
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
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
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
}
