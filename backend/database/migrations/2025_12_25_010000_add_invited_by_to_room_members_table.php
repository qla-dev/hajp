<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('room_members', function (Blueprint $table) {
            if (!Schema::hasColumn('room_members', 'invited_by')) {
                $table->unsignedBigInteger('invited_by')->nullable()->after('role');
                $table->foreign('invited_by')->references('id')->on('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('room_members', function (Blueprint $table) {
            if (Schema::hasColumn('room_members', 'invited_by')) {
                $table->dropForeign(['invited_by']);
                $table->dropColumn('invited_by');
            }
        });
    }
};
