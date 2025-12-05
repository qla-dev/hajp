<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_private')->default(0)->after('password');
        });

        Schema::table('friendships', function (Blueprint $table) {
            $table->boolean('approved')->default(1)->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('friendships', function (Blueprint $table) {
            $table->dropColumn('approved');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_private');
        });
    }
};
