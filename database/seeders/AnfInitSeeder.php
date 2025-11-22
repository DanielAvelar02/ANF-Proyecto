<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AnfInitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Usuarios
        DB::table('Usuario')->upsert([
            ['IdUsuario' => 'AD', 'NomUsuario' => 'admin', 'Clave' => '12345'],
            ['IdUsuario' => 'RE', 'NomUsuario' => 'restr', 'Clave' => '12345'],
        ], ['IdUsuario'], ['NomUsuario', 'Clave']);

        // 1. Crear Sectores (Tipos de Empresa)
        $sectorElectricoId = DB::table('tipo_empresas')->insertGetId([
            'nombre' => 'Sector Eléctrico',
            'descripcion' => 'Empresas dedicadas a la distribución y comercialización de energía eléctrica.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $sectorAgroId = DB::table('tipo_empresas')->insertGetId([
            'nombre' => 'Sector Agroindustrial',
            'descripcion' => 'Empresas dedicadas al procesamiento de caña de azúcar y productos derivados.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Crear Benchmarks del Sector 
        // NOTA: Se usan los nombres EXACTOS solicitados para asegurar la coincidencia.

        $this->crearBenchmarks($sectorElectricoId, [
            'Razón de Liquidez corriente o Razón de Circulante' => 0.95,
            'Razón de Capital de Trabajo a activos totales' => -0.05,
            'Razón de Rotación de cuentas por cobrar' => 6.5,
            'Razón de periodo medio de cobranza' => 55.0,
            'Razón de Rotación de cuentas por pagar' => 4.2,
            'Razón periodo medio de pago' => 85.0,
            'Índice de Rotación de Activos totales' => 1.8,
            'Índice de Rotación de Activos fijos' => 3.5,
            'Razón de Endeudamiento Patrimonial' => 1.50, // (Pasivo / Patrimonio aprox)
            'Grado de Propiedad' => 0.30,
            // Nuevos ratios agregados
            'Razón de Cobertura de Gastos Financieros' => 3.5,
            'Rentabilidad del Patrimonio (ROE)' => 0.10, // 10%
            'Rentabilidad del Activo (ROA)' => 0.05,    // 5%
            'Rentabilidad sobre Ventas' => 0.06,        // 6%
        ]);

        $this->crearBenchmarks($sectorAgroId, [
            'Razón de Liquidez corriente o Razón de Circulante' => 1.45,
            'Razón de Capital de Trabajo a activos totales' => 0.15,
            'Razón de Rotación de cuentas por cobrar' => 8.2,
            'Razón de periodo medio de cobranza' => 44.0,
            'Razón de Rotación de cuentas por pagar' => 3.8,
            'Razón periodo medio de pago' => 95.0,
            'Índice de Rotación de Activos totales' => 1.1,
            'Índice de Rotación de Activos fijos' => 2.1,
            'Razón de Endeudamiento Patrimonial' => 1.20,
            'Grado de Propiedad' => 0.45,
            // Nuevos ratios agregados
            'Razón de Cobertura de Gastos Financieros' => 2.8,
            'Rentabilidad del Patrimonio (ROE)' => 0.14, // 14%
            'Rentabilidad del Activo (ROA)' => 0.07,    // 7%
            'Rentabilidad sobre Ventas' => 0.09,        // 9%
        ]);

        // 3. Crear Empresas y sus Estados Financieros

        // --- EMPRESA 1: DELSUR (Eléctrica) ---
        $delsurId = $this->crearEmpresa('DELSUR, S.A. de C.V.', $sectorElectricoId);
        $cuentasDelsur = $this->crearCatalogoCuentas($delsurId);
        
        // Periodo 2023
        $this->insertarEstadoFinanciero($delsurId, '2023-12-31', $cuentasDelsur, [
            'Activo Corriente' => 70189432.00,
            'Pasivo Corriente' => 80720690.00,
            'Activo Total' => 190239887.00,
            'Pasivo Total' => 146546090.00,
            'Patrimonio' => 43693797.00,
            'Ventas Netas' => 376400000.00, 
            'Cuentas por Cobrar' => 50803298.00,
            'Cuentas por Pagar' => 47825305.00,
            'Compras' => 285500000.00,
            'Activo Fijo Neto' => 108167227.00,
            'Inventario' => 7232577.00,
        ]);

        // Periodo 2022
        $this->insertarEstadoFinanciero($delsurId, '2022-12-31', $cuentasDelsur, [
            'Activo Corriente' => 86214672.00,
            'Pasivo Corriente' => 87859755.00,
            'Activo Total' => 202779676.00,
            'Pasivo Total' => 147500000.00,
            'Patrimonio' => 55279676.00,
            'Ventas Netas' => 345200000.00,
            'Cuentas por Cobrar' => 56423424.00,
            'Cuentas por Pagar' => 54147107.00,
            'Compras' => 260000000.00,
            'Activo Fijo Neto' => 103952405.00,
            'Inventario' => 7819095.00,
        ]);

        // --- EMPRESA 2: EEO (Empresa Eléctrica de Oriente) ---
        $eeoId = $this->crearEmpresa('Empresa Eléctrica de Oriente (EEO)', $sectorElectricoId);
        $cuentasEeo = $this->crearCatalogoCuentas($eeoId);

        // Periodo 2023
        $this->insertarEstadoFinanciero($eeoId, '2023-12-31', $cuentasEeo, [
            'Activo Corriente' => 45200000.00,
            'Pasivo Corriente' => 42100000.00,
            'Activo Total' => 145550000.00,
            'Pasivo Total' => 85400000.00,
            'Patrimonio' => 60150000.00,
            'Ventas Netas' => 201156000.00,
            'Cuentas por Cobrar' => 28500000.00,
            'Cuentas por Pagar' => 25400000.00,
            'Compras' => 155000000.00,
            'Activo Fijo Neto' => 95200000.00,
            'Inventario' => 3100000.00,
        ]);

        // Periodo 2022
        $this->insertarEstadoFinanciero($eeoId, '2022-12-31', $cuentasEeo, [
            'Activo Corriente' => 38400000.00,
            'Pasivo Corriente' => 40500000.00,
            'Activo Total' => 138200000.00,
            'Pasivo Total' => 82100000.00,
            'Patrimonio' => 56100000.00,
            'Ventas Netas' => 176668000.00,
            'Cuentas por Cobrar' => 25200000.00,
            'Cuentas por Pagar' => 22800000.00,
            'Compras' => 135000000.00,
            'Activo Fijo Neto' => 92100000.00,
            'Inventario' => 2900000.00,
        ]);

        // --- EMPRESA 3: INGENIO EL ÁNGEL (Agroindustrial) ---
        $angelId = $this->crearEmpresa('Ingenio El Ángel, S.A. de C.V.', $sectorAgroId);
        $cuentasAngel = $this->crearCatalogoCuentas($angelId);

        // Periodo 2023
        $this->insertarEstadoFinanciero($angelId, '2023-12-31', $cuentasAngel, [
            'Activo Corriente' => 10813630.00,
            'Pasivo Corriente' => 17698080.00,
            'Activo Total' => 323000000.00,
            'Pasivo Total' => 221000000.00,
            'Patrimonio' => 102000000.00,
            'Ventas Netas' => 145000000.00,
            'Cuentas por Cobrar' => 12500000.00,
            'Cuentas por Pagar' => 15200000.00,
            'Compras' => 85000000.00,
            'Activo Fijo Neto' => 280000000.00,
            'Inventario' => 25000000.00,
        ]);

        // Periodo 2022
        $this->insertarEstadoFinanciero($angelId, '2022-12-31', $cuentasAngel, [
            'Activo Corriente' => 10728810.00,
            'Pasivo Corriente' => 27101120.00,
            'Activo Total' => 310000000.00,
            'Pasivo Total' => 207500000.00,
            'Patrimonio' => 102500000.00,
            'Ventas Netas' => 130000000.00,
            'Cuentas por Cobrar' => 11000000.00,
            'Cuentas por Pagar' => 22000000.00,
            'Compras' => 78000000.00,
            'Activo Fijo Neto' => 275000000.00,
            'Inventario' => 22000000.00,
        ]);

        // --- EMPRESA 4: GRUPO CASSA (Agroindustrial) ---
        $cassaId = $this->crearEmpresa('Compañía Azucarera Salvadoreña (CASSA)', $sectorAgroId);
        $cuentasCassa = $this->crearCatalogoCuentas($cassaId);

        // Periodo 2023
        $this->insertarEstadoFinanciero($cassaId, '2023-12-31', $cuentasCassa, [
            'Activo Corriente' => 150000000.00,
            'Pasivo Corriente' => 110000000.00,
            'Activo Total' => 450000000.00,
            'Pasivo Total' => 250000000.00,
            'Patrimonio' => 200000000.00,
            'Ventas Netas' => 501640235.00,
            'Cuentas por Cobrar' => 45000000.00,
            'Cuentas por Pagar' => 40000000.00,
            'Compras' => 320000000.00,
            'Activo Fijo Neto' => 280000000.00,
            'Inventario' => 55000000.00,
        ]);

        // Periodo 2022
        $this->insertarEstadoFinanciero($cassaId, '2022-12-31', $cuentasCassa, [
            'Activo Corriente' => 135000000.00,
            'Pasivo Corriente' => 120000000.00,
            'Activo Total' => 430000000.00,
            'Pasivo Total' => 245000000.00,
            'Patrimonio' => 185000000.00,
            'Ventas Netas' => 480500000.00,
            'Cuentas por Cobrar' => 42000000.00,
            'Cuentas por Pagar' => 45000000.00,
            'Compras' => 300000000.00,
            'Activo Fijo Neto' => 270000000.00,
            'Inventario' => 50000000.00,
        ]);
    }

    /**
     * Helpers privados
     */

    private function crearBenchmarks($sectorId, $valores)
    {
        foreach ($valores as $nombreRatio => $valor) {
            DB::table('benchmark_sectors')->insert([
                'tipo_empresa_id' => $sectorId,
                'nombreRatio' => $nombreRatio,
                'valorReferencia' => $valor,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function crearEmpresa($nombre, $tipoId)
    {
        return DB::table('empresas')->insertGetId([
            'nombre' => $nombre,
            'tipo_empresa_id' => $tipoId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Crea el catálogo de cuentas con códigos ordenados por centenas:
     * 100: Activo
     * 200: Pasivo
     * 300: Patrimonio
     * 400: Costos
     * 500: Ingresos
     */
    private function crearCatalogoCuentas($empresaId)
    {
        // Mapeo de nombres a códigos numéricos estándar (formato 100, 200...)
        $cuentasMap = [
            // GRUPO 100: ACTIVO
            'Activo Total'          => '100',
            'Activo Corriente'      => '110',
            'Cuentas por Cobrar'    => '112',
            'Inventario'            => '115',
            'Activo Fijo Neto'      => '120', // Activo No Corriente
            
            // GRUPO 200: PASIVO
            'Pasivo Total'          => '200',
            'Pasivo Corriente'      => '210',
            'Cuentas por Pagar'     => '211',
            
            // GRUPO 300: PATRIMONIO
            'Patrimonio'            => '300',
            
            // GRUPO 400: COSTOS (Egresos operativos)
            'Compras'               => '400', 
            
            // GRUPO 500: INGRESOS
            'Ventas Netas'          => '500', 
        ];

        $mapIds = [];

        foreach ($cuentasMap as $nombre => $codigo) {
            $id = DB::table('catalogo_cuentas')->insertGetId([
                'codigo_cuenta' => $codigo,
                'nombre_cuenta' => $nombre,
                'empresa_id' => $empresaId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $mapIds[$nombre] = $id;
        }

        return $mapIds;
    }

    private function insertarEstadoFinanciero($empresaId, $fecha, $mapaCuentas, $valores)
    {
        $estadoId = DB::table('estado_financieros')->insertGetId([
            'periodo' => $fecha,
            'empresa_id' => $empresaId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($valores as $nombreCuenta => $monto) {
            if (isset($mapaCuentas[$nombreCuenta])) {
                DB::table('detalle_estados')->insert([
                    'monto' => $monto,
                    'estado_financiero_id' => $estadoId,
                    'catalogo_cuenta_id' => $mapaCuentas[$nombreCuenta],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}