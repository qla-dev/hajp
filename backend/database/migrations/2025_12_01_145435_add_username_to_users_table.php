<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->after('name');
        });

        // Backfill usernames for existing rows to ensure uniqueness
        $existing = DB::table('users')->select('id', 'email', 'name')->get();
        $taken = DB::table('users')->whereNotNull('username')->pluck('username')->all();
        $taken = array_map('strtolower', $taken);

        foreach ($existing as $user) {
            if (!empty($user->username)) {
                continue;
            }
            $base = $user->email ? explode('@', $user->email)[0] : $user->name;
            $base = strtolower(preg_replace('/[^a-z0-9]+/i', '', $base));
            if ($base === '') {
                $base = 'user';
            }

            $candidate = $base;
            $suffix = 1;
            while (in_array($candidate, $taken, true)) {
                $candidate = $base . $suffix;
                $suffix++;
            }
            $taken[] = $candidate;

            DB::table('users')->where('id', $user->id)->update(['username' => $candidate]);
        }

        // Enforce uniqueness and not-null after backfill
        Schema::table('users', function (Blueprint $table) {
            $table->unique('username');
        });
        DB::statement('ALTER TABLE users MODIFY username VARCHAR(191) NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('username');
        });
    }
};

