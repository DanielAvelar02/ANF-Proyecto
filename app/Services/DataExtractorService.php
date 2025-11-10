<?php

namespace App\Services;

use App\Models\EstadoFinanciero;
use App\Models\DetalleEstado;
use App\Models\CatalogoCuenta;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB; // Usamos DB para consultas directas

class DataExtractorService
{

    // Se ajustaron las mayúsculas para que str_replace + lcfirst
    // generen el camelCase correcto (ej: cuentasPorCobrar)
    const CONCEPTOS_REQUERIDOS = [
        'Activo Corriente', 'Pasivo Corriente', 'Activo Total', 'Pasivo Total',
        'Patrimonio', 'Ventas Netas', 
        'Cuentas Por Cobrar', // 
        'Cuentas Por Pagar',  // 
        'Compras', 
        'Activo Fijo Neto',   // 
        'Inventario', 
    ];

    /**
     * 🟢 FUNCIÓN DE MAPEO INTELIGENTE (Corregida) 🟢
     * Se eliminaron todos los códigos fijos (ej: '111', '400') para
     * forzar la detección 100% basada en palabras clave de texto.
     */
    private function getMapeoEmpresa(int $empresaId): array
    {
        // 1. Definición de Palabras Clave y Prioridad
        // 
        // 🛑 CÓDIGOS NUMÉRICOS ELIMINADOS. Ahora solo buscará por texto.
        //
        $keywordMap = [
            // Ratios de Liquidez y Estructura
            'Activo Corriente'      => ['Activo Corriente', 'Activo Circulante'],
            'Pasivo Corriente'      => ['Pasivo Corriente', 'Pasivo Circulante'],
            'Activo Total'          => ['Activo Total', 'Activo General'],
            'Pasivo Total'          => ['Pasivo Total', 'Pasivo General'],
            'Patrimonio'            => ['Patrimonio', 'Capital Contable'],
            
            // Ratios de Rotación
            'Ventas Netas'          => ['Ventas Netas', 'Ingresos de Operación', 'Ventas', 'Ingresos'],
            'Cuentas Por Cobrar'    => ['Cuentas por Cobrar', 'Deudores Comerciales'], // <-- CORREGIDO
            'Cuentas Por Pagar'     => ['Cuentas por Pagar', 'Acreedores Comerciales'], // <-- CORREGIDO
            'Compras'               => ['Compras', 'Costo de Ventas', 'Costo de la Mercancia Vendida'],
            'Activo Fijo Neto'      => ['Activo Fijo Neto', 'Propiedad Planta y Equipo Neto'], // <-- CORREGIDO
            'Inventario'            => ['Inventario', 'Existencias'],
        ];

        // 2. Obtener las cuentas del catálogo de la empresa
        $catalogo = CatalogoCuenta::where('empresa_id', $empresaId)->get(['codigo_cuenta', 'nombre_cuenta']);
        
        $mapeoFinal = [];

        // 3. Iterar sobre los conceptos requeridos e intentar mapear
        foreach (self::CONCEPTOS_REQUERIDOS as $concepto) {
            if (!isset($keywordMap[$concepto])) {
                continue; 
            }

            $keywords = $keywordMap[$concepto];
            $codigoMapeado = null;

            foreach ($keywords as $keyword) {
                // Buscamos coincidencia en el nombre O en el código
                $coincidencia = $catalogo->first(function ($cuenta) use ($keyword) {
                    $normKeyword = mb_strtolower(trim($keyword));
                    $normNombre = mb_strtolower(trim($cuenta->nombre_cuenta));
                    $normCodigo = mb_strtolower(trim($cuenta->codigo_cuenta));

                    // El 'if' de código fijo ya no funcionará (lo cual es bueno)
                    // A menos que un nombre de cuenta sea '110' (improbable)
                    if ($normCodigo === $normKeyword) {
                        return true;
                    }
                    // La lógica principal ahora es esta:
                    return str_contains($normNombre, $normKeyword);
                });

                if ($coincidencia) {
                    $codigoMapeado = $coincidencia->codigo_cuenta;
                    break; // Mapeo encontrado, pasamos al siguiente concepto
                }
            }
            
            if ($codigoMapeado) {
                $mapeoFinal[$concepto] = $codigoMapeado;
            }
        }
        
        return $mapeoFinal;
    }


    /**
     * Extracción de Montos
     */
    public function getMontosPorPeriodo(int $empresaId, int $periodo): array
    {
        $montosExtraccion = [];
        $mapeoCodigos = $this->getMapeoEmpresa($empresaId);

        $estado = EstadoFinanciero::where('empresa_id', $empresaId)->whereYear('periodo', $periodo)->first();

        if (!$estado) {
            $defaultKeys = array_map(fn($k) => lcfirst(str_replace(' ', '', $k)), self::CONCEPTOS_REQUERIDOS);
            return array_fill_keys($defaultKeys, 0.0);
        }

        foreach (self::CONCEPTOS_REQUERIDOS as $nombreClave) {
            $codigo = $mapeoCodigos[$nombreClave] ?? null; 
            

            // Esta lógica ahora creará 'cuentasPorCobrar' en lugar de 'cuentasporCobrar'
            $claveDestino = lcfirst(str_replace(' ', '', $nombreClave));
            
            $monto = 0.0;
            if ($codigo) {
                $monto = DB::table('detalle_estados')
                    ->join('catalogo_cuentas', 'detalle_estados.catalogo_cuenta_id', '=', 'catalogo_cuentas.id')
                    ->where('detalle_estados.estado_financiero_id', $estado->id)
                    ->where('catalogo_cuentas.codigo_cuenta', $codigo)
                    ->sum('detalle_estados.monto');
            }
            
            $montosExtraccion[$claveDestino] = (float) $monto;
        }

        return $montosExtraccion;
    }
}