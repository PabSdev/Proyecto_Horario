document.addEventListener('DOMContentLoaded', function () {
  // Datos de ejemplo - Aquí conectarías con tu BDD
  const horarioData = {
    lunes: {
      '15:30': true,
      '16:00': true,
      '16:30': false,
      '17:00': true,
      '17:30': true,
      '18:00': false,
      '18:30': true,
      '19:00': false,
      '19:30': true,
    },
    martes: {
      '15:30': false,
      '16:00': true,
      '16:30': true,
      '17:00': false,
      '17:30': true,
      '18:00': true,
      '18:30': false,
      '19:00': true,
      '19:30': false,
    },
    miercoles: {
      '15:30': true,
      '16:00': false,
      '16:30': true,
      '17:00': true,
      '17:30': false,
      '18:00': true,
      '18:30': true,
      '19:00': false,
      '19:30': true,
    },
    jueves: {
      '15:30': false,
      '16:00': false,
      '16:30': true,
      '17:00': true,
      '17:30': true,
      '18:00': false,
      '18:30': true,
      '19:00': true,
      '19:30': false,
    },
    viernes: {
      '15:30': true,
      '16:00': true,
      '16:30': false,
      '17:00': false,
      '17:30': true,
      '18:00': true,
      '18:30': false,
      '19:00': true,
      '19:30': true,
    },
  };

  // Horas disponibles
  const horas = [
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
  ];

  // Días de la semana
  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

  // Generar tabla de horarios
  const tbody = document.getElementById('horario-tbody');

  horas.forEach((hora) => {
    const tr = document.createElement('tr');

    // Celda de hora
    const tdHora = document.createElement('td');
    tdHora.className = 'p-3 border border-gray-300 font-medium';
    tdHora.textContent = hora;
    tr.appendChild(tdHora);

    // Celdas para cada día
    dias.forEach((dia) => {
      const td = document.createElement('td');
      td.className =
        'p-3 border border-gray-300 text-center ' +
        (horarioData[dia][hora] ? 'disponible' : 'no-disponible');

      const icon = document.createElement('span');
      if (horarioData[dia][hora]) {
        icon.innerHTML = '✓';
        icon.className = 'text-green-600 font-bold';
      } else {
        icon.innerHTML = '✗';
        icon.className = 'text-red-600 font-bold';
      }

      td.appendChild(icon);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  // Calcular estadísticas
  function calcularEstadisticas() {
    const totalSlots = dias.length * horas.length;
    const disponiblesPorDia = {};
    let disponiblesTotal = 0;

    dias.forEach((dia) => {
      disponiblesPorDia[dia] = 0;
      horas.forEach((hora) => {
        if (horarioData[dia][hora]) {
          disponiblesTotal++;
          disponiblesPorDia[dia]++;
        }
      });
    });

    const porcentajeDisponible = Math.round(
      (disponiblesTotal / totalSlots) * 100
    );

    // Actualizar barra de disponibilidad
    document.getElementById('disponibilidad-barra').style.width =
      porcentajeDisponible + '%';
    document.getElementById('disponibilidad-porcentaje').textContent =
      porcentajeDisponible;

    return {
      porcentajeDisponible,
      disponiblesPorDia,
    };
  }

  // Inicializar gráfico de distribución
  function inicializarGraficoDistribucion(disponiblesPorDia) {
    const ctx = document.getElementById('chart-distribucion').getContext('2d');

    const diasCapitalizados = dias.map(
      (dia) => dia.charAt(0).toUpperCase() + dia.slice(1)
    );
    const datosDisponibles = dias.map((dia) => disponiblesPorDia[dia]);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: diasCapitalizados,
        datasets: [
          {
            label: 'Horas disponibles',
            data: datosDisponibles,
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: horas.length,
            ticks: {
              stepSize: 1,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  // Event listeners para botones
  document
    .getElementById('btn-exportar')
    .addEventListener('click', function () {
      alert('Funcionalidad: Exportar horario a PDF/Excel');
      // Aquí implementarías la lógica para exportar
    });

  document
    .getElementById('btn-optimizar')
    .addEventListener('click', function () {
      alert('Funcionalidad: Generar horario optimizado');
      // Aquí implementarías la lógica para optimizar el horario
    });

  // Inicializar estadísticas
  const stats = calcularEstadisticas();
  inicializarGraficoDistribucion(stats.disponiblesPorDia);
});
