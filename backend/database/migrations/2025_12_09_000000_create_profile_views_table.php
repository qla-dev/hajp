<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profile_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auth_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('visitor_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['auth_user_id', 'visitor_id'], 'profile_views_owner_visitor_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profile_views');
    }
};
