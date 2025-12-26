<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('votes', function (Blueprint $table) {
            // Remove FK so we can allow null skips
            $table->dropForeign(['selected_user_id']);
        });

        // Allow null values for skipped votes
        DB::statement('ALTER TABLE votes MODIFY selected_user_id BIGINT UNSIGNED NULL');
    }

    public function down(): void
    {
        // Revert to NOT NULL and restore FK
        DB::statement('ALTER TABLE votes MODIFY selected_user_id BIGINT UNSIGNED NOT NULL');

        Schema::table('votes', function (Blueprint $table) {
            $table
                ->foreign('selected_user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }
};
