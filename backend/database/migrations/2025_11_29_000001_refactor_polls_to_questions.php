<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // add is_18_over to rooms
        Schema::table('rooms', function (Blueprint $table) {
            $table->boolean('is_18_over')->default(false)->after('type');
        });

        // drop old vote/poll tables if they exist
        Schema::dropIfExists('poll_votes');
        Schema::dropIfExists('polls');

        // create minimal polls table (poll instances per room)
        Schema::create('polls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->string('status')->default('active');
            $table->timestamps();
        });

        // questions table (formerly polls)
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poll_id')->constrained('polls')->onDelete('cascade');
            $table->string('question');
            $table->string('emoji')->nullable();
            $table->unsignedBigInteger('creator_id');
            $table->timestamps();

            $table->foreign('creator_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('selected_user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votes');
        Schema::dropIfExists('question_votes');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('polls');

        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn('is_18_over');
        });
    }
};
