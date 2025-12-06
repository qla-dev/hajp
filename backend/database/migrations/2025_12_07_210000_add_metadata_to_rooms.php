<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->string('cover_url')->nullable()->after('is_18_over');
            $table->string('tagline')->nullable()->after('cover_url');
            $table->text('description')->nullable()->after('tagline');
        });
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn(['cover_url', 'tagline', 'description']);
        });
    }
};
