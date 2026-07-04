<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        try {
            DB::statement('CREATE INDEX cashout_history_user_id_index ON cashout_history (user_id)');
        } catch (Throwable) {
            // Index may already exist.
        }

        try {
            DB::statement('CREATE INDEX cashout_history_poll_id_index ON cashout_history (poll_id)');
        } catch (Throwable) {
            // Index may already exist.
        }

        Schema::table('cashout_history', function (Blueprint $table) {
            $table->dropUnique('cashout_history_user_id_poll_id_unique');
            $table->unique(['user_id', 'poll_id', 'room_id'], 'cashout_history_user_poll_room_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cashout_history', function (Blueprint $table) {
            $table->dropUnique('cashout_history_user_poll_room_unique');
            $table->unique(['user_id', 'poll_id'], 'cashout_history_user_id_poll_id_unique');
        });
    }
};
