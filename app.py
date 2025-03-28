from sqlite3 import IntegrityError

from flask import Flask, render_template, request, jsonify
import json
import database as db
import mysql.connector
from markupsafe import escape

# Configuración de la aplicación Flask
app = Flask(__name__)
app.debug = True  


# Rutas principales
@app.route('/')
def landing_page():
    return render_template('index.html')


@app.route('/Form')
def form():
    return render_template('Form.html')





@app.route('/Dashboard')
def dashboard():
    profesores = db.get_data()  # Obtiene los datos de la BD
    for profesor in profesores:
        try:
            horario = json.loads(profesor.get('Horario', '{}'))
        except json.JSONDecodeError:
            horario = {}
        profesor['horario'] = horario


    total_profesores = db.get_profesores()
    dias_profesores = contar_dias_profesor(profesores)

    return render_template('dashboard.html',
                           profesores=profesores,
                           total_profesores=total_profesores,
                           dias_profesores=dias_profesores)

@app.route('/buscar_profesor', methods=['GET'])
def buscar_profesor():
    query = request.args.get('query', '').strip()
    profesores = db.search_profesor(query)

    dias_profesores = contar_dias_profesor(profesores)

    resultados = []
    for profesor in profesores:
        nombre_completo = f"{profesor['Nombre']} {profesor['Apellidos']}"

        try:
            horario = json.loads(profesor.get('Horario', '{}') or '{}')  # Evita errores en JSON
            horas_asignadas = sum(len(horas) for horas in horario.values())  # Total de horas
        except (json.JSONDecodeError, TypeError):
            horas_asignadas = 0

        #Extraemos los datos de la bdd y los declaramos aqui
        resultados.append({
            'id': profesor.get('id', ''),
            'Nombre': profesor.get('Nombre', ''),
            'Apellidos': profesor.get('Apellidos', ''),
            'Ciclo': profesor.get('Ciclo', ''),
            'dias_totales': dias_profesores.get(nombre_completo, 0),
            'horas_asignadas': horas_asignadas
        })

    return jsonify(resultados)


# Ruta para manejar el formulario
@app.route('/submit-form', methods=['POST'])
def submit_form():
    nombre = escape(request.form.get('nombre', '').strip())
    apellidos = escape(request.form.get('apellidos', '').strip())
    dias = request.form.getlist('dias[]')
    ciclo = request.form.get('ciclos')

    horarios = {
        dia: request.form.getlist(f'horas[{dia}][]')
        for dia in dias if request.form.getlist(f'horas[{dia}][]')
    }

    if not nombre or not apellidos or not dias or not horarios:
        return jsonify({'error': 'Todos los campos son obligatorios'}), 400

    horarios_json = json.dumps(horarios)

    try:
        db.upload_data(nombre, apellidos, ciclo, horarios_json)
        return jsonify({'message': 'Datos guardados correctamente'}), 200
    except IntegrityError:
        return jsonify({'error': 'El profesor ya existe en la base de datos'}), 400
    except mysql.connector.Error as e:
        return jsonify({'error': f'Error en la base de datos: {str(e)}'}), 500


def contar_dias_profesor(profesores):
    """
    Toma una lista de diccionarios con la clave 'Horario' (en formato JSON)
    y devuelve un diccionario con el nombre del profesor y la cantidad de días asignados.
    """
    resultado = {}

    for profesor in profesores:
        nombre_completo = f"{profesor['Nombre']} {profesor['Apellidos']}"
        try:
            horario = json.loads(profesor['Horario']) if profesor['Horario'] else {}
            dias_asignados = len(horario)  # Contar las claves (días) en el JSON
        except (json.JSONDecodeError, TypeError, KeyError):
            dias_asignados = 0

        resultado[nombre_completo] = dias_asignados

    return resultado


# Ejecución de la aplicación
if __name__ == '__main__':
    app.run(debug=True)