<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\PollController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\AnonInboxController;
use App\Http\Controllers\ShareLinkController;
use App\Http\Controllers\ShareLinkStyleController;
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

Route::get('/share/styles', [ShareLinkStyleController::class, 'index']);
Route::get('/share/{user}/messages', [ShareLinkController::class, 'messages']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('user')->group(function () {
        Route::get('/', fn (Request $request) => $request->user());
        Route::get('/coins', [UserController::class, 'coins']);
        Route::get('/rooms', [RoomController::class, 'userRooms']);
        Route::match(['put', 'patch'], '/', [UserController::class, 'update']);
        Route::post('/photo', [UserController::class, 'uploadPhoto']);
        Route::delete('/photo', [UserController::class, 'removePhoto']);
        Route::get('/votes', [QuestionController::class, 'myVotes']);
        Route::get('/activities', [QuestionController::class, 'activities']);
    });

    Route::prefix('questions')->group(function () {
        Route::post('/{question}/vote', [QuestionController::class, 'vote']);
        Route::post('/{question}/skip', [QuestionController::class, 'skip']);
    });

    Route::prefix('rooms')->group(function () {
        Route::post('/', [RoomController::class, 'store']);
        Route::get('/{room}/polling', [RoomController::class, 'activeQuestion']);
        Route::post('/questions/active/bulk', [RoomController::class, 'bulkActiveQuestions']);
        Route::get('/status', [RoomController::class, 'status']);
        Route::get('/{room}/cashout/status', [RoomController::class, 'cashoutStatus']);
        Route::post('/{room}/cashout', [RoomController::class, 'cashout']);
        Route::post('/{room}/join', [RoomController::class, 'join']);
        Route::post('/{room}/cover', [RoomController::class, 'uploadCover']);
        Route::get('/{room}/rank/{period}', [RoomController::class, 'rank']);
        Route::post('/join-code', [RoomController::class, 'joinByCode']);
    });

    Route::prefix('subscription')->group(function () {
        Route::get('/status', [SubscriptionController::class, 'status']);
        Route::post('/subscribe', [SubscriptionController::class, 'subscribe']);
    });

    Route::prefix('friends')->group(function () {
        Route::get('/suggestions', [UserController::class, 'friendSuggestions']);
        Route::get('/', [UserController::class, 'friends']);
        Route::get('/requests', [UserController::class, 'friendRequests']);
        Route::post('/{user}/add', [UserController::class, 'addFriend'])->middleware('isPrivate');
        Route::post('/{user}/approve', [UserController::class, 'approveFriend']);
        Route::delete('/{user}/remove', [UserController::class, 'removeFriend']);
    });

    Route::prefix('users')->group(function () {
        Route::get('/{user}/views', [UserController::class, 'profileViews']);
        Route::post('/{user}/views', [UserController::class, 'recordProfileView']);
        Route::get('/{user}', [UserController::class, 'showPublic']);
        Route::get('/{user}/rooms', [UserController::class, 'roomsForUser']);
        Route::get('/{user}/friends/count', [UserController::class, 'friendsCount']);
        Route::get('/{user}/friendship/status', [UserController::class, 'friendshipStatus']);
    });
});

// Simple unauthenticated test endpoint
Route::get('/ping', fn () => ['ok' => true, 'ts' => now()->toIso8601String()]);
