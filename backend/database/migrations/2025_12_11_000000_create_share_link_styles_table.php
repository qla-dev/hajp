<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('share_link_styles', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('question')->nullable();
            $table->boolean('premium')->default(false);
            $table->string('color', 32)->nullable();
            $table->string('bg', 64)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('share_link_styles');
    }
};
