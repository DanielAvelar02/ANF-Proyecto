<?php
/* Comentario de Avelar:
Los archivos de la carpeta app/Http/Requests contienen clases que gestionan
la validación de solicitudes HTTP. Estas clases extienden FormRequest de Laravel
y definen reglas específicas para validar los datos entrantes.

En vez de escribir la validación directamente en los controladores, se crea 
una clase Request personalizada para cada tipo de formulario o petición. 
Dentro de estas clases puedes definir reglas de validación, mensajes 
personalizados y lógica de autorización.*/

namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

// Valida la entrada para la proyección de ventas
class ProyeccionRequest extends FormRequest
{
    // Permitir que cualquier usuario haga esta solicitud
    public function authorize(): bool
    {
        return true; // Esto puede cambiar para implementar lógica de autorización por roles
    }

    // Reglas de validación para la solicitud
    public function rules(): array
    {
        return [
            'metodo' => 'required|in:minimos_cuadrados,incremento_porcentual,incremento_absoluto',
            'valores' => 'required|array|min:11|max:12',
            'valores.*' => 'numeric|min:0', // ventas no negativas
        ];
    }

    // Mensajes de error personalizados
    public function messages(): array
    {
        return [
            'valores.min' => 'Debe proporcionar al menos 11 meses de datos.',
            'valores.max' => 'Solo se aceptan 12 meses para la base histórica.',
        ];
    }
}
