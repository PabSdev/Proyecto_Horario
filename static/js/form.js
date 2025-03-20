// Generar horas automáticamente
const generateHours = () => {
    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
    days.forEach((day) => {
        const container = document.getElementById(`${day}-hours`)
        for (let hour = 15; hour <= 20; hour++) {
            const hourBlock = `
                        <div class="relative">
                            <input type="checkbox" id="${day}-${hour}" 
                                   class="hour-checkbox peer hidden" 
                                   data-day="${day}" 
                                   data-hour="${hour}:00">
                            <label for="${day}-${hour}" 
                                   class="block p-2 text-sm border-2 border-[#2873b9] rounded-md cursor-pointer
                                          peer-checked:bg-[#2873b9] peer-checked:text-white transition-colors">
                                ${hour}:00
                            </label>
                        </div>
                    `
            container.insertAdjacentHTML('beforeend', hourBlock)
        }
    })
}

// Mostrar/ocultar horas cuando se selecciona un día
document
    .querySelectorAll('input[type="checkbox"][data-day]')
    .forEach((checkbox) => {
        checkbox.addEventListener('change', (e) => {
            const dayContainer = document.getElementById(
                `${e.target.dataset.day}-hours`
            )
            dayContainer.classList.toggle('hidden')
            if (e.target.checked) {
                dayContainer.classList.add('grid')
            } else {
                dayContainer.classList.remove('grid')
                // Deseleccionar horas cuando se deselecciona el día
                dayContainer
                    .querySelectorAll('.hour-checkbox')
                    .forEach((hour) => (hour.checked = false))
            }
        })
    })

// Manejar el envío del formulario
document.getElementById('availabilityForm').addEventListener('submit', (e) => {
    e.preventDefault()

    const selectedAvailability = {}
    const days = document.querySelectorAll('input[data-day]:checked')

    days.forEach((day) => {
        const dayName = day.dataset.day
        const hours = Array.from(
            document.querySelectorAll(
                `input[data-day="${dayName}"].hour-checkbox:checked`
            )
        ).map((hour) => hour.dataset.hour)

        selectedAvailability[dayName] = hours
    })

    // Mostrar mensaje de éxito
    const successMessage = document.getElementById('successMessage')
    successMessage.textContent = '¡Disponibilidad guardada correctamente! 🎉'
    successMessage.classList.remove('hidden')

    setTimeout(() => {
        successMessage.classList.add('hidden')
    }, 3000)

    console.log('Disponibilidad guardada:', selectedAvailability)
})

// Inicializar horas al cargar la página
generateHours()
