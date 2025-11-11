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
    // Corresponde a tu tabla "ResultadoRatio"
    Schema::create('resultado_ratios', function (Blueprint $table) {
        $table->id(); // idResultado (PK)

        // idRatio (FK1)
        $table->foreignId('ratio_id')->constrained('ratios')->onDelete('cascade');

        // idEstado (FK2) - Enlazamos a estado_financieros
        $table->foreignId('estado_financiero_id')->constrained('estado_financieros')->onDelete('cascade');

        $table->decimal('valor_calculado', 14, 4)->default(0.0);

        $table->timestamps();

        // Un ratio solo debe existir una vez por estado financiero
        $table->unique(['ratio_id', 'estado_financiero_id']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resultado_ratios');
    }
};
