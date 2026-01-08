<?php

namespace App\Http\Controllers;

use App\Models\AnonymousMessage;
use App\Models\ShareLinkStyle;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ShareLinkController extends Controller
{
    public function show(string $user, string $slug)
    {
        $userModel = User::where('username', $user)->firstOrFail();
        $style = ShareLinkStyle::where('slug', $slug)->first();

        return view('share.send_anonymous_message', $this->buildData($userModel, $slug, $style));
    }

    public function success(Request $request, string $user, string $slug)
    {
        $userModel = User::where('username', $user)->firstOrFail();
        $style = ShareLinkStyle::where('slug', $slug)->first();

        $data = $this->buildData($userModel, $slug, $style);
        $data['tapCount'] = 216;

        if ($request->isMethod('post')) {
            $message = trim($request->input('message', ''));
            if ($message) {
                AnonymousMessage::create([
                    'user_id' => $userModel->id,
                    'message' => $message,
                    'style_id' => $style?->id,
                ]);
            }
            return response()->json(['status' => 'saved']);
        }

        return view('share.success', $data);
    }

    protected function buildData(User $user, string $slug, ?ShareLinkStyle $style): array
    {
        $gradientStart = $style?->color ?? '#ff5193';
        $gradientEnd = $style?->bg ?? '#ff8c29';
        $question = $style?->question ?? 'send me anonymous messages!';
        $profilePhoto = $user->profile_photo ? url($user->profile_photo) : 'https://ui-avatars.com/api/?name=' . urlencode($user->name ?? $user->username);

        return [
            'username' => $user->username,
            'displayName' => $user->name ?? '@' . $user->username,
            'profilePhoto' => $profilePhoto,
            'question' => $question,
            'link' => url("/share/{$user->username}/{$slug}"),
            'slug' => $slug,
            'gradientStart' => $gradientStart,
            'gradientEnd' => $gradientEnd,
            'tapCount' => 256,
            'isPremium' => (bool) ($style?->premium ?? false),
        ];
    }

    public function messages(Request $request, User $user)
    {
        $pageParam = $request->query('page');
        $limitParam = $request->query('limit');

        $query = AnonymousMessage::where('user_id', $user->id)
            ->with('style:id,slug,question,color,bg')
            ->orderByDesc('created_at');

        $mapMessage = static function (AnonymousMessage $message) {
            return [
                'id' => $message->id,
                'message' => $message->message,
                'question' => $message->style?->question,
                'slug' => $message->style?->slug,
                'style' => $message->style?->only(['question', 'slug', 'color', 'bg']),
                'created_at' => $message->created_at,
            ];
        };

        if ($pageParam !== null || $limitParam !== null) {
            $limit = max(1, (int) ($limitParam ?? 10));
            $page = max(1, (int) ($pageParam ?? 1));
            $offset = ($page - 1) * $limit;

            $messages = (clone $query)
                ->skip($offset)
                ->take($limit)
                ->get()
                ->map($mapMessage);

            $total = (clone $query)->count();

            return response()->json([
                'messages' => $messages,
                'meta' => [
                    'page' => $page,
                    'limit' => $limit,
                    'has_more' => $offset + $limit < $total,
                ],
            ]);
        }

        $messages = $query->get()->map($mapMessage);

        return [
            'messages' => $messages,
        ];
    }
}
