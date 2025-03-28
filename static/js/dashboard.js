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
                                    profesor.Ciclo
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

    // pequeño retraso para búsqueda automática mientras se escribe
    let timeoutId
    busquedaInput.addEventListener('input', function () {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(realizarBusqueda, 500) // 500ms de retraso
    })

    // Cargar todos los profesores al inicio
    realizarBusqueda()
})

document.addEventListener('DOMContentLoaded', function() {
    // Get a reference to the export button
    const exportButton = document.querySelector('.p-5.border-b button');

    // Load html2pdf library if not already loaded
    if (typeof html2pdf === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = function() {
            setupExportButton(exportButton);
        };
        document.head.appendChild(script);
    } else {
        setupExportButton(exportButton);
    }

    function setupExportButton(button) {
        if (button) {
            button.addEventListener('click', exportScheduleToPDF);
        }
    }

    function exportScheduleToPDF() {
        // Show loading indicator
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando PDF...
            </div>
        `;
        document.body.appendChild(notification);

        // Get the schedule container
        const scheduleContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-5').closest('.p-4');

        // Clone it to avoid modifying the original
        const clonedContainer = scheduleContainer.cloneNode(true);

        // Apply custom styles for the PDF
        const styles = `
            .grid { display: flex; flex-wrap: wrap; }
            .md\\:grid-cols-5 > * { width: 19%; margin: 0.5%; }
            .max-h-96 { max-height: none; }
        `;

        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        clonedContainer.prepend(styleElement);

        // Set PDF options
        const opt = {
            margin: 10,
            filename: 'horario-profesores.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        // Generate PDF
        html2pdf().set(opt).from(clonedContainer).save().then(() => {
            // Update notification on success
            notification.className = 'fixed top-4 right-4 px-4 py-2 bg-green-600 text-white rounded shadow-lg z-50';
            notification.innerHTML = `
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    PDF generado correctamente
                </div>
            `;

            // Remove notification after 3 seconds
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }).catch(error => {
            showErrorNotification(notification, `Error al generar PDF: ${error.message}`);
        });
    }

    function showErrorNotification(notification, message) {
        notification.className = 'fixed top-4 right-4 px-4 py-2 bg-red-600 text-white rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                ${message}
            </div>
        `;

        // Remove error notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        console.error(message);
    }
});