// Datos de ejemplo para el gráfico
document.addEventListener('DOMContentLoaded', function () {
  // Generar filas de horario
  const tbody = document.getElementById('horario-tbody');
  const horas = [
    '8:00 - 9:00',
    '9:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
  ];

  horas.forEach((hora) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50';

    // Celda de hora
    const tdHora = document.createElement('td');
    tdHora.className = 'p-3 border border-gray-200 font-medium';
    tdHora.textContent = hora;
    tr.appendChild(tdHora);

    // Celdas para cada día
    for (let i = 0; i < 5; i++) {
      const td = document.createElement('td');
      td.className = 'p-3 border border-gray-200';

      // Agregar contenido aleatorio para demostración
      if (Math.random() > 0.6) {
        const asignatura = [
          'Programación',
          'Matemáticas',
          'Bases de Datos',
          'Sistemas',
          'Redes',
        ][Math.floor(Math.random() * 5)];
        const profesor = [
          'J. Díaz',
          'M. López',
          'A. García',
          'C. Martínez',
          'R. Fernández',
        ][Math.floor(Math.random() * 5)];
        const aula = ['A101', 'A102', 'B201', 'B202', 'C301'][
          Math.floor(Math.random() * 5)
        ];

        const div = document.createElement('div');
        div.className = 'bg-primary/10 p-2 rounded border-l-4 border-primary';

        const pAsignatura = document.createElement('p');
        pAsignatura.className = 'font-medium text-sm';
        pAsignatura.textContent = asignatura;

        const pProfesor = document.createElement('p');
        pProfesor.className = 'text-xs text-gray-600';
        pProfesor.textContent = profesor;

        const pAula = document.createElement('p');
        pAula.className = 'text-xs text-gray-600';
        pAula.textContent = aula;

        div.appendChild(pAsignatura);
        div.appendChild(pProfesor);
        div.appendChild(pAula);

        td.appendChild(div);
      }

      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  });

  // Gráfico de distribución
  const ctx = document.getElementById('chart-distribucion').getContext('2d');
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
  });
});
