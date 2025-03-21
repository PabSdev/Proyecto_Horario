// Generar horas automáticamente
const generateHours = () => {
    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
    days.forEach((day) => {
        const container = document.getElementById(`${day}-hours`)
        
        let hour = 15
        let minutes = 30

        while (true) {
            const hourStr = hour.toString().padStart(2, '0')
            const minuteStr = minutes.toString().padStart(2, '0')
            const timeValue = `${hourStr}:${minuteStr}`
            const idValue = `${day}-${hourStr}${minuteStr}`

            const hourBlock = `
                <div class="form-check">
                    <input type="checkbox" id="${idValue}" name="horas[${day}][]" value="${timeValue}" class="form-check-input" />
                    <label for="${idValue}" class="form-check-label">${timeValue}</label>
                </div>
            `
            container.insertAdjacentHTML('beforeend', hourBlock)

            // Condición de parada después de mostrar 20:00
            if (hour === 20 && minutes === 0) break

            // Sumar 1 hora
            hour += 1
            // Después de 15:30 viene 16:30, etc., pero a las 19:30 sigue 20:00
            if (hour === 20) {
                minutes = 0
            }
        }
    })
}




document.addEventListener('DOMContentLoaded', function() {
    // Inicializar horas al cargar la página
    generateHours()
    
    // Mostrar/ocultar horas cuando se selecciona un día
    document.querySelectorAll('.day-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const day = this.value;
            const timeCard = document.getElementById(`${day}-card`);
            
            if (this.checked) {
                timeCard.style.display = 'block';
            } else {
                timeCard.style.display = 'none';
                // Deseleccionar horas cuando se deselecciona el día
                const dayContainer = document.getElementById(`${day}-hours`);
                if (dayContainer) {
                    dayContainer.querySelectorAll('.hour-checkbox')
                        .forEach((hour) => (hour.checked = false));
                }
            }
        });
    });

    // Manejar el envío del formulario
    const form = document.getElementById('availabilityForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const selectedAvailability = {};
            const days = document.querySelectorAll('.day-checkbox:checked');

            days.forEach((day) => {
                const dayName = day.value;
                const hours = Array.from(
                    document.querySelectorAll(
                        `input[data-day="${dayName}"].hour-checkbox:checked`
                    )
                ).map((hour) => hour.dataset.hour);

                selectedAvailability[dayName] = hours;
            });

            // Mostrar mensaje de éxito
            const successMessage = document.getElementById('successMessage');
            if (successMessage) {
                successMessage.textContent = '¡Disponibilidad guardada correctamente! 🎉';
                successMessage.classList.remove('hidden');

                setTimeout(() => {
                    successMessage.classList.add('hidden');
                }, 3000);
            }

            console.log('Disponibilidad guardada:', selectedAvailability);
        });
    }
});


document.getElementById('submit').addEventListener('click', function() {
    alert('Disponibilidad guardada correctamente!');
});