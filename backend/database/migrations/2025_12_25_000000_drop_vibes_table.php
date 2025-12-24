<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('vibes');
    }

    public function down(): void
    {
        // No-op: original table structure not restored here
    }
};
