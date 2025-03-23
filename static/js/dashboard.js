// Datos de ejemplo para el gráfico
document.addEventListener('DOMContentLoaded', function () {
    // Generar filas de horario
    const tbody = document.getElementById('horario-tbody')
    const horas = [
        '15:30 - 16:30',
        '16:30 - 17:30',
        '17:30 - 18:30',
        '18:30 - 19:30',
        '19:30 - 20:30',
    ]

    horas.forEach((hora) => {
        const tr = document.createElement('tr')
        tr.className = 'hover:bg-gray-50'

        // Celda de hora
        const tdHora = document.createElement('td')
        tdHora.className = 'p-3 border border-gray-200 font-medium'
        tdHora.textContent = hora
        tr.appendChild(tdHora)

        // Celdas para cada día
        for (let i = 0; i < 5; i++) {
            const td = document.createElement('td')
            td.className = 'p-3 border border-gray-200'

            // Agregar contenido aleatorio para demostración
            if (Math.random() > 0.6) {
                const asignatura = [
                    'Programación',
                    'Matemáticas',
                    'Bases de Datos',
                    'Sistemas',
                    'Redes',
                ][Math.floor(Math.random() * 5)]
                const profesor = [
                    'J. Díaz',
                    'M. López',
                    'A. García',
                    'C. Martínez',
                    'R. Fernández',
                ][Math.floor(Math.random() * 5)]
                const aula = ['A101', 'A102', 'B201', 'B202', 'C301'][
                    Math.floor(Math.random() * 5)
                ]

                const div = document.createElement('div')
                div.className =
                    'bg-primary/10 p-2 rounded border-l-4 border-primary'

                const pAsignatura = document.createElement('p')
                pAsignatura.className = 'font-medium text-sm'
                pAsignatura.textContent = asignatura

                const pProfesor = document.createElement('p')
                pProfesor.className = 'text-xs text-gray-600'
                pProfesor.textContent = profesor

                const pAula = document.createElement('p')
                pAula.className = 'text-xs text-gray-600'
                pAula.textContent = aula

                div.appendChild(pAsignatura)
                div.appendChild(pProfesor)
                div.appendChild(pAula)

                td.appendChild(div)
            }

            tr.appendChild(td)
        }

        tbody.appendChild(tr)
    })

    // Gráfico de distribución
    const ctx = document.getElementById('chart-distribucion').getContext('2d')
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
            datasets: [
                {
                    label: 'Horas asignadas',
                    data: [18, 16, 20, 14, 12],
                    backgroundColor: [
                        '#00509e',
                        '#2873b9',
                        '#4a96d3',
                        '#6cb9ed',
                        '#8edcff',
                    ],
                    borderWidth: 0,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 24,
                },
            },
        },
    })
})

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
