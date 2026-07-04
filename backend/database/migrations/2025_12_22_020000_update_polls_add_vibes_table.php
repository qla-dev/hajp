<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('polls')) {
            Schema::disableForeignKeyConstraints();
            try {
                DB::statement('ALTER TABLE polls DROP FOREIGN KEY polls_room_id_foreign');
            } catch (Throwable) {
                // The foreign key may not exist on every database.
            }

            Schema::table('polls', function (Blueprint $table) {
                if (Schema::hasColumn('polls', 'room_id')) {
                    $table->dropColumn('room_id');
                }

                if (!Schema::hasColumn('polls', 'vibes')) {
                    $table->json('vibes')->nullable()->after('id');
                }
            });
            Schema::enableForeignKeyConstraints();
        }

        if (!Schema::hasTable('vibes')) {
            Schema::create('vibes', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('polls')) {
            Schema::disableForeignKeyConstraints();
            Schema::table('polls', function (Blueprint $table) {
                if (!Schema::hasColumn('polls', 'room_id')) {
                    $table->unsignedBigInteger('room_id')->nullable()->after('id');
                }

                if (Schema::hasColumn('polls', 'vibes')) {
                    $table->dropColumn('vibes');
                }
            });
            Schema::enableForeignKeyConstraints();
        }

        Schema::dropIfExists('vibes');
    }
};
