<?php

namespace App\Http\Controllers;

use App\Models\AnonymousInbox;
use App\Models\AnonymousMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AnonInboxController extends Controller
{
    public function show(User $user)
    {
        $inbox = AnonymousInbox::firstOrCreate(
            ['user_id' => $user->id],
            ['share_link' => config('app.url') . '/inbox/' . Str::uuid()]
        );
        $inbox->load('messages');
        return $inbox;
    }

    public function createMessage(Request $request)
    {
        $data = $request->validate([
            'inbox_id' => 'required|integer|exists:anonymous_inboxes,id',
            'message' => 'required|string',
            'metadata' => 'array',
        ]);
        $msg = AnonymousMessage::create([
            'inbox_id' => $data['inbox_id'],
            'message' => $data['message'],
            'metadata' => $data['metadata'] ?? null,
        ]);
        return response()->json($msg, 201);
    }
}
