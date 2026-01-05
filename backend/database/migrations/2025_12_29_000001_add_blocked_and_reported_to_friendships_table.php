<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('friendships', function (Blueprint $table) {
            $table->boolean('blocked')->default(0)->after('approved');
            $table->text('reported')->nullable()->after('blocked');
        });

        DB::table('friendships')->update([
            'blocked' => 0,
            'reported' => '0',
        ]);
    }

    public function down(): void
    {
        Schema::table('friendships', function (Blueprint $table) {
            $table->dropColumn(['blocked', 'reported']);
        });
    }
};
