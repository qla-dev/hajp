<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PollController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\AnonInboxController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/polls', [PollController::class, 'index']);
Route::get('/polls/{poll}', [PollController::class, 'show']);
Route::post('/polls/{poll}/refresh', [PollController::class, 'refreshOptions']);

Route::get('/anonymous/inbox/{user}', [AnonInboxController::class, 'show']);

Route::post('/anonymous/message', [AnonInboxController::class, 'createMessage']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/polls', [PollController::class, 'store']);
    Route::post('/polls/{poll}/vote', [PollController::class, 'vote']);
    Route::get('/subscription/status', [SubscriptionController::class, 'status']);
    Route::post('/subscription/subscribe', [SubscriptionController::class, 'subscribe']);
});

// Simple unauthenticated test endpoint
Route::get('/ping', fn () => ['ok' => true, 'ts' => now()->toIso8601String()]);
