<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\PollController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\AnonInboxController;
use App\Http\Controllers\UserController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/questions', [QuestionController::class, 'index']);
Route::get('/questions/{question}', [QuestionController::class, 'show']);
Route::post('/questions/{question}/refresh', [QuestionController::class, 'refreshOptions']);
Route::get('/rooms', [RoomController::class, 'index']);

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

    Route::prefix('user')->group(function () {
        Route::get('/', fn (Request $request) => $request->user());
        Route::get('/rooms', [RoomController::class, 'userRooms']);
        Route::match(['put', 'patch'], '/', [UserController::class, 'update']);
        Route::post('/photo', [UserController::class, 'uploadPhoto']);
        Route::delete('/photo', [UserController::class, 'removePhoto']);
    });

    Route::prefix('questions')->group(function () {
        Route::post('/{question}/vote', [QuestionController::class, 'vote']);
        Route::post('/{question}/skip', [QuestionController::class, 'skip']);
    });

    Route::prefix('my')->group(function () {
        Route::get('/votes', [QuestionController::class, 'myVotes']);
    });

    Route::prefix('rooms')->group(function () {
        Route::get('/{room}/questions/active', [RoomController::class, 'activeQuestion']);
    });

    Route::prefix('subscription')->group(function () {
        Route::get('/status', [SubscriptionController::class, 'status']);
        Route::post('/subscribe', [SubscriptionController::class, 'subscribe']);
    });
});

// Simple unauthenticated test endpoint
Route::get('/ping', fn () => ['ok' => true, 'ts' => now()->toIso8601String()]);
