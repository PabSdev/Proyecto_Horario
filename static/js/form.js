const DAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
const WORKING_HOURS = { start: { hour: 15, minute: 30 }, end: { hour: 20, minute: 0 } };

const generateTimeSlots = () => {
    const times = [];
    let { hour, minute } = WORKING_HOURS.start;

    while (true) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(time);

        if (hour === WORKING_HOURS.end.hour && minute === WORKING_HOURS.end.minute) break;

        hour += 1;
        if (hour === WORKING_HOURS.end.hour) {
            minute = WORKING_HOURS.end.minute;
        }
    }

    return times;
};

const createTimeBlockHTML = (day, time) => {
    const [hours, minutes] = time.split(':');
    const id = `${day}-${hours}${minutes}`;

    return `
        <label class="form-check bg-white hover:bg-gray-50 p-2 rounded-md border border-gray-200 shadow-sm flex items-center gap-2 cursor-pointer transition-colors">
            <input type="checkbox"
                id="${id}"
                name="horas[${day}][]"
                value="${time}"
                class="form-check-input hour-checkbox accent-primary"
                data-day="${day}"
                data-hour="${time}"
            />
            <i class="fas fa-clock text-primary text-sm"></i> ${time}
        </label>
    `;
};

const initializeDaySelection = () => {
    DAYS.forEach(day => {
        const checkbox = document.querySelector(`.day-checkbox[value="${day}"]`);
        const card = document.getElementById(`${day}-card`);

        checkbox.addEventListener('change', () => {
            card.style.display = checkbox.checked ? 'block' : 'none';

            if (!checkbox.checked) {
                document.querySelectorAll(`input[data-day="${day}"]`).forEach(input => {
                    input.checked = false;
                });
                updateSummary();
            }
        });
    });
};

const handleFormSubmission = () => {
    const form = document.getElementById('availabilityForm');
    const submitButton = document.getElementById('submit');
    const successMessage = document.getElementById('successMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';

        try {
            const response = await fetch('/submit-form', {
                method: 'POST',
                body: new FormData(form)
            });

            const data = await response.json();
            if (data.message) {
                successMessage.classList.remove('hidden');
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => successMessage.classList.add('hidden'), 5000);
            } else if (data.error) {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar la solicitud');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Enviar Solicitud';
        }
    });
};

const setupHourSelection = () => {
    DAYS.forEach(day => {
        const container = document.getElementById(`${day}-hours`);
        container.addEventListener('change', (e) => {
            if (e.target.classList.contains('hour-checkbox')) {
                updateSummary();
            }
        });
    });
};

const updateSummary = () => {
    let hasSelections = false;

    DAYS.forEach(day => {
        const checkboxes = [...document.querySelectorAll(`input[data-day="${day}"]:checked`)];
        const summaryList = document.getElementById(`${day}-summary-list`);
        summaryList.innerHTML = '';

        if (checkboxes.length > 0) {
            hasSelections = true;
            document.getElementById(`${day}-summary`).classList.remove('hidden');

            checkboxes
                .map(checkbox => checkbox.dataset.hour)
                .sort()
                .forEach(hour => {
                    summaryList.insertAdjacentHTML('beforeend', `
                        <li class="flex justify-between items-center bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors mb-2 border border-gray-200 shadow-sm">
                            <span class="flex items-center">
                                <i class="fas fa-clock text-primary mr-2"></i> ${hour}
                            </span>
                            <button type="button" 
                                class="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                                data-day="${day}"
                                data-hour="${hour}"
                                onclick="removeHourSelection(event)"
                                title="Eliminar ${hour}">
                                <i class="fas fa-times"></i>
                            </button>
                        </li>
                    `);
                });
        } else {
            document.getElementById(`${day}-summary`).classList.add('hidden');
        }
    });

    document.getElementById('no-selection-message').classList.toggle('hidden', hasSelections);
    document.getElementById('selections-summary').classList.toggle('hidden', !hasSelections);
    document.getElementById('confirm-message').classList.toggle('hidden', !hasSelections);
};

const removeHourSelection = (e) => {
    const { day, hour } = e.target.dataset;
    const listItem = e.target.closest('li');

    listItem.classList.add('opacity-0');
    setTimeout(() => {
        document.querySelector(`input[data-day="${day}"][data-hour="${hour}"]`).checked = false;
        updateSummary();
    }, 300);
};

// Inicialización principal
document.addEventListener('DOMContentLoaded', () => {
    // Generar bloques de horas
    DAYS.forEach(day => {
        const container = document.getElementById(`${day}-hours`);
        container.innerHTML = generateTimeSlots().map(time => createTimeBlockHTML(day, time)).join('');
    });

    initializeDaySelection();
    setupHourSelection();
    handleFormSubmission();
    updateSummary();
});