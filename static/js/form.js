const generateHours = () => {
    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    days.forEach((day) => {
        const container = document.getElementById(`${day}-hours`);
        container.innerHTML = ''; // Limpiar antes de agregar contenido

        let hour = 15;
        let minutes = 30;

        while (true) {
            const hourStr = hour.toString().padStart(2, '0');
            const minuteStr = minutes.toString().padStart(2, '0');
            const timeValue = `${hourStr}:${minuteStr}`;
            const idValue = `${day}-${hourStr}${minuteStr}`;

            const hourBlock = `
                <label class="form-check bg-white hover:bg-gray-50 p-2 rounded-md border border-gray-200 shadow-sm flex items-center gap-2 cursor-pointer transition-colors">
                    <input
                        type="checkbox"
                        id="${idValue}"
                        name="horas[${day}][]"
                        value="${timeValue}"
                        class="form-check-input hour-checkbox accent-primary"
                        data-day="${day}"
                        data-hour="${timeValue}"
                    />
                    <i class="fas fa-clock text-primary text-sm"></i> ${timeValue}
                </label>
            `;
            container.insertAdjacentHTML('beforeend', hourBlock);

            // Condición de parada después de mostrar 20:00
            if (hour === 20 && minutes === 0) break;

            // Sumar 1 hora
            hour += 1;
            if (hour === 20) {
                minutes = 0;
            }
        }
    });
};

document.addEventListener('DOMContentLoaded', function () {
    generateHours();

    document.querySelectorAll('.day-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const day = this.value;
            const timeCard = document.getElementById(`${day}-card`);

            if (this.checked) {
                timeCard.style.display = 'block';
            } else {
                timeCard.style.display = 'none';

                // Deseleccionar todas las horas si el día se deselecciona
                document.querySelectorAll(`input[data-day="${day}"]`).forEach(hourCheckbox => {
                    hourCheckbox.checked = false;
                });

                // Actualizar el resumen cuando se deselecciona un día
                updateSummary();
            }
        });
    });

    // Enviar los datos al backend Flask con mejor feedback
    document.getElementById('availabilityForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(this);
        const submitButton = document.getElementById('submit');
        const successMessage = document.getElementById('successMessage');

        // Deshabilitar el botón durante el envío
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';

        fetch('/submit-form', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    // Mostrar mensaje de éxito
                    successMessage.classList.remove('hidden');
                    successMessage.scrollIntoView({behavior: 'smooth', block: 'center'});

                    // Ocultar después de 5 segundos
                    setTimeout(() => {
                        successMessage.classList.add('hidden');
                    }, 5000);
                } else if (data.error) {
                    alert('Error: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error al enviar:', error);
                alert('Ocurrió un error al procesar la solicitud');
            })
            .finally(() => {
                // Restaurar el botón
                submitButton.disabled = false;
                submitButton.innerHTML = 'Enviar Solicitud';
            });
    });

    // Añadir listeners para checkboxes de horas
    document.querySelectorAll('.hour-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSummary);
    });

    // Inicializar el resumen
    updateSummary();
});

// Función mejorada para actualizar el resumen de horarios seleccionados
function updateSummary() {
    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    let anySelected = false;

    days.forEach(day => {
        const summaryContainer = document.getElementById(`${day}-summary`);
        const summaryList = document.getElementById(`${day}-summary-list`);
        const checkboxes = document.querySelectorAll(`input[data-day="${day}"]:checked`);

        // Limpiar la lista actual
        summaryList.innerHTML = '';

        if (checkboxes.length > 0) {
            anySelected = true;
            summaryContainer.classList.remove('hidden');

            // Ordenar las horas seleccionadas
            const selectedHours = Array.from(checkboxes).map(cb => cb.dataset.hour);
            selectedHours.sort();

            // Añadir cada hora a la lista con un botón para eliminar
            selectedHours.forEach(hour => {
                const listItem = document.createElement('li');
                listItem.className = 'flex justify-between items-center bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors mb-2 border border-gray-200 shadow-sm';

                const hourSpan = document.createElement('span');
                hourSpan.className = 'flex items-center';
                hourSpan.innerHTML = `<i class="fas fa-clock text-primary mr-2"></i> ${hour}`;

                const deleteButton = document.createElement('button');
                deleteButton.type = 'button';
                deleteButton.className = 'text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-colors';
                deleteButton.innerHTML = '<i class="fas fa-times"></i>';
                deleteButton.dataset.day = day;
                deleteButton.dataset.hour = hour;
                deleteButton.addEventListener('click', removeHourSelection);
                deleteButton.title = `Eliminar ${hour}`;

                listItem.appendChild(hourSpan);
                listItem.appendChild(deleteButton);
                summaryList.appendChild(listItem);
            });
        } else {
            summaryContainer.classList.add('hidden');
        }
    });

    // Mostrar/ocultar mensajes según si hay selecciones
    const noSelectionMessage = document.getElementById('no-selection-message');
    const selectionsSummary = document.getElementById('selections-summary');

    if (anySelected) {
        noSelectionMessage.classList.add('hidden');
        selectionsSummary.classList.remove('hidden');
        toggleConfirmMessage(true);
    } else {
        noSelectionMessage.classList.remove('hidden');
        selectionsSummary.classList.add('hidden');
        toggleConfirmMessage(false);
    }
}

// Función mejorada para eliminar una selección de hora con animación
function removeHourSelection(e) {
    const day = e.currentTarget.dataset.day;
    const hour = e.currentTarget.dataset.hour;
    const listItem = e.currentTarget.parentElement;

    // Añadir animación de desvanecimiento
    listItem.classList.add('opacity-0');
    listItem.style.transition = 'opacity 0.3s ease';

    setTimeout(() => {
        // Encontrar y desmarcar el checkbox correspondiente
        const checkbox = document.querySelector(`input[data-day="${day}"][data-hour="${hour}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }

        // Actualizar el resumen
        updateSummary();
    }, 300);
}

// Función para mostrar/ocultar el mensaje de confirmación
function toggleConfirmMessage(show) {
    const confirmMessage = document.getElementById('confirm-message');
    if (show) {
        confirmMessage.classList.remove('hidden');
    } else {
        confirmMessage.classList.add('hidden');
    }
}

// Eliminar el alert básico al enviar
document.getElementById('submit').addEventListener('click', function (e) {
    // El mensaje se maneja en el evento submit del formulario
});