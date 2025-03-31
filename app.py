from sqlite3 import IntegrityError
from flask import Flask, render_template, request, jsonify
import json
import database as db
import mysql.connector
from markupsafe import escape

# Configuración de la aplicación Flask
app = Flask(__name__)
app.debug = True  # Habilita el modo debug para facilitar la depuración


# Rutas principales
@app.route('/')
def landing_page():
    """Renderiza la página de inicio."""
    return render_template('index.html')


@app.route('/Form')
def form():
    """Renderiza la página del formulario."""
    return render_template('Form.html')


@app.route('/Dashboard')
def dashboard():
    """Renderiza el panel de control con información de los profesores."""
    profesores = db.get_data()  # Obtiene los datos de la BD

    # Procesa los horarios de los profesores
    for profesor in profesores:
        try:
            horario = json.loads(profesor.get('Horarios', '{}'))  # Convierte JSON a diccionario
        except json.JSONDecodeError:
            horario = {}
        profesor['horario'] = horario

    total_profesores = db.get_profesores()  # Obtiene el total de profesores
    dias_profesores = contar_dias_profesor(profesores)  # Cuenta los días asignados a cada profesor
    distribucion = agrupar_horarios_por_ciclo(profesores)  # Agrupa horarios por ciclo

    return render_template('dashboard.html',
                           profesores=profesores,
                           total_profesores=total_profesores,
                           dias_profesores=dias_profesores,
                           distribucion=distribucion)


@app.route('/buscar_profesor', methods=['GET'])
def buscar_profesor():
    """Busca profesores en la base de datos según un criterio de búsqueda."""
    query = request.args.get('query', '').strip()
    profesores = db.search_profesor(query)  # Realiza la búsqueda en la BD

    dias_profesores = contar_dias_profesor(profesores)
    resultados = []

    for profesor in profesores:
        nombre_completo = f"{profesor['Nombre']} {profesor['Apellidos']}"
        try:
            horario = json.loads(profesor.get('Horario', '{}') or '{}')  # Convierte el horario JSON
            horas_asignadas = sum(len(horas) for horas in horario.values())  # Calcula las horas asignadas
        except (json.JSONDecodeError, TypeError):
            horas_asignadas = 0

        # Agrega los datos procesados a la lista de resultados
        resultados.append({
            'id': profesor.get('id', ''),
            'Nombre': profesor.get('Nombre', ''),
            'Apellidos': profesor.get('Apellidos', ''),
            'Ciclo': profesor.get('Ciclo', ''),
            'dias_totales': dias_profesores.get(nombre_completo, 0),
            'horas_asignadas': horas_asignadas
        })

    return jsonify(resultados)


# Ruta para manejar el envío del formulario
@app.route('/submit-form', methods=['POST'])
def submit_form():
    """Recibe los datos del formulario y los guarda en la base de datos."""
    nombre = escape(request.form.get('nombre', '').strip())
    apellidos = escape(request.form.get('apellidos', '').strip())
    dias = request.form.getlist('dias[]')  # Lista de días seleccionados
    ciclo = request.form.get('ciclos')  # Ciclo formativo seleccionado

    # Obtiene los horarios asignados
    horarios = {
        dia: request.form.getlist(f'horas[{dia}][]')
        for dia in dias if request.form.getlist(f'horas[{dia}][]')
    }

    # Valida que todos los campos requeridos estén presentes
    if not nombre or not apellidos or not dias or not horarios:
        return jsonify({'error': 'Todos los campos son obligatorios'}), 400

    horarios_json = json.dumps(horarios)  # Convierte los horarios en JSON

    try:
        db.upload_data(nombre, apellidos, ciclo, horarios_json)  # Guarda los datos en la BD
        return jsonify({'message': 'Datos guardados correctamente'}), 200
    except IntegrityError:
        return jsonify({'error': 'El profesor ya existe en la base de datos'}), 400
    except mysql.connector.Error as e:
        return jsonify({'error': f'Error en la base de datos: {str(e)}'}), 500


# Función para agrupar los horarios de los profesores por ciclo

def agrupar_horarios_por_ciclo(profesores):
    """Agrupa los horarios de los profesores por ciclo y selecciona el más frecuente."""
    horarios_finales = {}

    # Primera pasada: Recopilar todos los profesores por hora y ciclo
    for profesor in profesores:
        ciclo = profesor.get('Ciclo', 'Sin ciclo')
        for dia, horarios_dia in profesor['horario'].items():
            if dia not in horarios_finales:
                horarios_finales[dia] = {}

            for hora in horarios_dia:
                if hora not in horarios_finales[dia]:
                    horarios_finales[dia][hora] = []
                horarios_finales[dia][hora].append({
                    'nombre': profesor['Nombre'],
                    'apellidos': profesor['Apellidos'],
                    'ciclo': ciclo
                })

    # Segunda pasada: Seleccionar el ciclo dominante para cada hora
    for dia, horas in horarios_finales.items():
        for hora, profesores_hora in horas.items():
            contador_ciclos = {}
            sin_ciclo = []  # Lista para almacenar profesores sin ciclo

            for prof in profesores_hora:
                ciclo = prof['ciclo']
                if ciclo == 'Sin ciclo':
                    sin_ciclo.append(prof)  # Almacenar profesores sin ciclo
                else:
                    contador_ciclos[ciclo] = contador_ciclos.get(ciclo, 0) + 1

            ciclos_ordenados = sorted(
                contador_ciclos.items(),
                key=lambda x: (-x[1], x[0] != 'Sin ciclo')
            )

            if ciclos_ordenados:
                ciclo_seleccionado, _ = ciclos_ordenados[0]
                horarios_finales[dia][hora] = [
                                                  prof for prof in profesores_hora if
                                                  prof['ciclo'] == ciclo_seleccionado
                                              ] + sin_ciclo  # Añadir profesores sin ciclo

    return horarios_finales


# Función para contar los días asignados a cada profesor
def contar_dias_profesor(profesores):
    """Cuenta la cantidad de días en los que cada profesor tiene clases asignadas."""
    resultado = {}

    for profesor in profesores:
        nombre_completo = f"{profesor['Nombre']} {profesor['Apellidos']}"
        try:
            horario = json.loads(profesor['Horario']) if profesor['Horario'] else {}
            dias_asignados = len(horario)  # Cuenta los días asignados
        except (json.JSONDecodeError, TypeError, KeyError):
            dias_asignados = 0

        resultado[nombre_completo] = dias_asignados

    return resultado


# Ejecución de la aplicación
if __name__ == '__main__':
    app.run(debug=True)  # Inicia la aplicación en modo debug
