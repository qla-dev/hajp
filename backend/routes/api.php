<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\PollController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\AnonInboxController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/questions', [QuestionController::class, 'index']);
Route::get('/questions/{question}', [QuestionController::class, 'show']);
Route::post('/questions/{question}/refresh', [QuestionController::class, 'refreshOptions']);
Route::post('/questions/{question}/skip', [QuestionController::class, 'skip']);

Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{room}/questions/active', [RoomController::class, 'activeQuestion']);

// basic polls CRUD
Route::get('/polls', [PollController::class, 'index']);
Route::get('/polls/{poll}', [PollController::class, 'show']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/polls', [PollController::class, 'store']);
    Route::put('/polls/{poll}', [PollController::class, 'update']);
    Route::patch('/polls/{poll}', [PollController::class, 'update']);
    Route::delete('/polls/{poll}', [PollController::class, 'destroy']);
});

Route::get('/anonymous/inbox/{user}', [AnonInboxController::class, 'show']);

Route::post('/anonymous/message', [AnonInboxController::class, 'createMessage']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/questions/{question}/vote', [QuestionController::class, 'vote']);
    Route::get('/subscription/status', [SubscriptionController::class, 'status']);
    Route::post('/subscription/subscribe', [SubscriptionController::class, 'subscribe']);
});

// Simple unauthenticated test endpoint
Route::get('/ping', fn () => ['ok' => true, 'ts' => now()->toIso8601String()]);
