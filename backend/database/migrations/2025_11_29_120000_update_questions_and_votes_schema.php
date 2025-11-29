<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('question_votes')) {
            Schema::rename('question_votes', 'votes');
        }

        if (Schema::hasTable('votes')) {
            Schema::table('votes', function (Blueprint $table) {
                if (Schema::hasColumn('votes', 'selected_option')) {
                    $table->dropColumn('selected_option');
                }

                if (!Schema::hasColumn('votes', 'selected_user_id')) {
                    $table->foreignId('selected_user_id')->after('user_id')->constrained('users')->onDelete('cascade');
                }
            });
        }

        if (Schema::hasTable('questions')) {
            Schema::table('questions', function (Blueprint $table) {
                if (Schema::hasColumn('questions', 'options')) {
                    $table->dropColumn('options');
                }

                if (Schema::hasColumn('questions', 'target_school')) {
                    $table->dropColumn('target_school');
                }

                if (Schema::hasColumn('questions', 'active')) {
                    $table->dropColumn('active');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('questions')) {
            Schema::table('questions', function (Blueprint $table) {
                if (!Schema::hasColumn('questions', 'options')) {
                    $table->json('options')->nullable();
                }

                if (!Schema::hasColumn('questions', 'target_school')) {
                    $table->string('target_school')->nullable();
                }

                if (!Schema::hasColumn('questions', 'active')) {
                    $table->boolean('active')->default(true);
                }
            });
        }

        if (Schema::hasTable('votes')) {
            Schema::table('votes', function (Blueprint $table) {
                if (Schema::hasColumn('votes', 'selected_user_id')) {
                    $table->dropForeign(['selected_user_id']);
                    $table->dropColumn('selected_user_id');
                }

                if (!Schema::hasColumn('votes', 'selected_option')) {
                    $table->string('selected_option');
                }
            });

            Schema::rename('votes', 'question_votes');
        }
    }
};
