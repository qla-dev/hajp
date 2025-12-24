<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('room_members', function (Blueprint $table) {
            if (!Schema::hasColumn('room_members', 'accepted')) {
                $table->boolean('accepted')->default(1)->after('approved');
            }
        });
    }

    public function down(): void
    {
        Schema::table('room_members', function (Blueprint $table) {
            if (Schema::hasColumn('room_members', 'accepted')) {
                $table->dropColumn('accepted');
            }
        });
    }
};
