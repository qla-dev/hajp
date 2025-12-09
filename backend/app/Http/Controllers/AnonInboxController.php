<?php

namespace App\Http\Controllers;

use App\Models\AnonymousMessage;
use App\Models\User;
use Illuminate\Http\Request;

class AnonInboxController extends Controller
{
    public function show(User $user)
    {
        $messages = AnonymousMessage::where('user_id', $user->id)
            ->with('style:id,question,slug,color,bg')
            ->orderByDesc('id')
            ->get();

        return [
            'messages' => $messages->map(function (AnonymousMessage $message) {
                return [
                    'id' => $message->id,
                    'message' => $message->message,
                    'question' => $message->style?->question,
                    'style' => $message->style?->only(['question', 'slug', 'color', 'bg']),
                    'created_at' => $message->created_at,
                ];
            }),
        ];
    }

    public function createMessage(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'message' => 'required|string',
            'style_id' => 'nullable|integer|exists:share_link_styles,id',
        ]);
        $msg = AnonymousMessage::create([
            'user_id' => $data['user_id'],
            'message' => $data['message'],
            'style_id' => $data['style_id'] ?? null,
        ]);
        return response()->json($msg, 201);
    }
}
