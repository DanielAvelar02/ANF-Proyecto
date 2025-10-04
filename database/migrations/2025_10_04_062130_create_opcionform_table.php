<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('OpcionForm', function (Blueprint $t) {
            $t->char('IdOpcion', 3)->primary();
            $t->string('DesOpcion', 30);
            $t->integer('NumForm')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('OpcionForm');
    }
};
