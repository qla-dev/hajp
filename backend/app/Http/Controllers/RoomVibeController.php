<?php

namespace App\Http\Controllers;

use App\Models\RoomVibe;

class RoomVibeController extends Controller
{
    public function index()
    {
        $vibes = RoomVibe::query()
            ->orderBy('id')
            ->get(['id', 'name', 'slug', 'icon', 'description']);

        return response()->json(['data' => $vibes]);
    }
}
