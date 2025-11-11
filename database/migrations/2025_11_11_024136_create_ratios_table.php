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
    // Corresponde a tu tabla "Ratio"
    Schema::create('ratios', function (Blueprint $table) {
        $table->id(); // idRatio (PK)
        $table->string('key')->unique(); // 'key' (ej: '1', '2') para mapeo interno
        $table->string('nombre_ratio', 100);
        $table->string('descripcion', 255)->nullable(); // desOpcion
        $table->string('formula', 255)->nullable();
        $table->string('categoria', 100)->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ratios');
    }
};
