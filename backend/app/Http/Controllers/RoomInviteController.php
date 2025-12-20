<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Routing\Controller;

class RoomInviteController extends Controller
{
    public function show(string $code)
    {
        $code = strtoupper($code);
        $room = Room::where('code', $code)->firstOrFail();

        $cover = $room->cover_url;
        if ($cover && !str_starts_with($cover, ['http://', 'https://'])) {
            $cover = url($cover);
        }

        $membersCount = $room->members_count;
        if ($membersCount === null) {
            $membersCount = $room->members()->count();
        }

        return view('room.invite_code', [
            'roomName' => $room->name ?? 'HaJP soba',
            'tagline' => $room->tagline,
            'members' => $membersCount ?? 0,
            'privacy' => $room->is_private ? 'Privatna soba' : 'Javna soba',
            'code' => $room->code,
            'cover' => $cover,
            'description' => $room->description,
        ]);
    }
}
