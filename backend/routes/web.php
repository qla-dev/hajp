<?php

use App\Http\Controllers\ShareLinkController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\RoomInviteController;

Route::prefix('share')->group(function () {
    Route::get('/{user}/{slug}', [ShareLinkController::class, 'show'])->name('share.show');
    Route::match(['get', 'post'], '/{user}/{slug}/success', [ShareLinkController::class, 'success'])->name('share.success');
});

Route::get('/room/invite-code/{code}', [RoomInviteController::class, 'show'])->name('room.invite_code');
