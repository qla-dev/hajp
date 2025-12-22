<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('votes') && !Schema::hasColumn('votes', 'room_id')) {
            Schema::table('votes', function (Blueprint $table) {
                $table->foreignId('room_id')
                    ->nullable()
                    ->after('question_id')
                    ->constrained('rooms')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('votes') && Schema::hasColumn('votes', 'room_id')) {
            Schema::table('votes', function (Blueprint $table) {
                $table->dropForeign(['room_id']);
                $table->dropColumn('room_id');
            });
        }
    }
};
