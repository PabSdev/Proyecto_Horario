document.addEventListener('DOMContentLoaded', function () {
    const busquedaInput = document.getElementById('busqueda')
    const profesoresTabla = document.querySelector(
        '.min-w-full.divide-y.divide-gray-200 tbody'
    )

    // Función para realizar la búsqueda
    function realizarBusqueda() {
        const query = busquedaInput.value.trim()

        // Si el campo está vacío, cargar todos los profesores
        fetch(`/buscar_profesor?query=${encodeURIComponent(query)}`)
            .then((response) => response.json())
            .then((data) => {
                // Limpiar la tabla
                profesoresTabla.innerHTML = ''

                // Si no hay resultados
                if (data.length === 0) {
                    const tr = document.createElement('tr')
                    tr.innerHTML = `
                            <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                                No se encontraron profesores con ese criterio de búsqueda
                            </td>
                        `
                    profesoresTabla.appendChild(tr)
                    return
                }

                // Agregar los resultados a la tabla
                data.forEach((profesor) => {
                    const tr = document.createElement('tr')
                    tr.innerHTML = `
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0 h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                                        <span class="text-primary font-medium">
                                            ${
                                                profesor.Nombre
                                                    ? profesor.Nombre[0]
                                                    : ''
                                            }
                                        </span>
                                    </div>
                                    <div class="ml-4">
                                        <div class="text-sm font-medium text-gray-900">
                                            ${profesor.Nombre}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${
                                    profesor.Apellidos
                                }</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${
                                    profesor.dias_totales
                                }</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${
                                    profesor.horas_asignadas || 0
                                }</div>
                                <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div class="bg-primary h-2 rounded-full" 
                                         style="width: ${
                                             ((profesor.horas_asignadas || 0) /
                                                 24) *
                                             100
                                         }%"></div>
                                </div>
                            </td>
                        `
                    profesoresTabla.appendChild(tr)
                })
            })
            .catch((error) => {
                console.error('Error al buscar profesores:', error)
                profesoresTabla.innerHTML = `
                        <tr>
                            <td colspan="4" class="px-6 py-4 text-center text-red-500">
                                Error al buscar profesores. Por favor, inténtelo de nuevo.
                            </td>
                        </tr>
                    `
            })
    }

    // Evento para realizar la búsqueda al presionar Enter
    busquedaInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault()
            realizarBusqueda()
        }
    })

    // También podemos agregar un pequeño retraso para búsqueda automática mientras se escribe
    let timeoutId
    busquedaInput.addEventListener('input', function () {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(realizarBusqueda, 500) // 500ms de retraso
    })

    // Cargar todos los profesores al inicio
    realizarBusqueda()
})
