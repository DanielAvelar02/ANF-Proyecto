<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Actions\ImportarEstadoFinancieroAction; // Asegúrate de importar la nueva clase

class ImportacionController extends Controller
{
    /**
     * Muestra la vista para subir el archivo.
     */
    public function showUploadForm()
    {
        return view('importar');
    }

    /**
     * Procesa el archivo de importación.
     */
    public function import(Request $request)
    {
        $request->validate([
            'archivo_excel' => 'required|mimes:xlsx,xls|max:10240',
        ]);

        try {
            $empresa_id = Auth::user()->empresa_id;

            if (!$empresa_id) {
                 return back()->with('error', 'No se pudo identificar la empresa del usuario.');
            }

            // Obtenemos la ruta temporal del archivo subido
            $path = $request->file('archivo_excel')->getRealPath();

            // Instanciamos y ejecutamos nuestra acción
            $action = new ImportarEstadoFinancieroAction($empresa_id);
            $action->execute($path);

            return back()->with('success', '¡Estado financiero importado exitosamente!');

        } catch (\Exception $e) {
            // Capturamos cualquier excepción lanzada por nuestra acción
            return back()->with('error', 'Ocurrió un error: ' . $e->getMessage());
        }
    }
}