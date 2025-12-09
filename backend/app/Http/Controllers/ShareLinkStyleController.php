<?php

namespace App\Http\Controllers;

use App\Models\ShareLinkStyle;
use Illuminate\Routing\Controller;

class ShareLinkStyleController extends Controller
{
    public function index()
    {
        return ShareLinkStyle::orderBy('id')->get(['id', 'slug', 'question', 'color', 'bg', 'premium']);
    }
}
