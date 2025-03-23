from flask import Flask, render_template, request, jsonify
import json
import database as db
import mysql.connector

# Configuración de la aplicación Flask
app = Flask(__name__)
app.debug = True  # Se usa app.debug en lugar de app.config['Debug']


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
    total_profesores = db.get_profesores()

    # Contar los días asignados para cada profesor
    dias_profesores = contar_dias_profesor(profesores)

    return render_template('Dashboard.html', profesores=profesores, total_profesores=total_profesores,
                           dias_profesores=dias_profesores)


@app.route('/busqueda_profesores', methods=['GET'])
def busqueda_profesores():
    query = request.args.get('query', '').strip()

    # Filtrar los profesores basados en el nombre o apellido
    profesores = db.get_data()
    resultados = []

    for profesor in profesores:
        if query.lower() in profesor['Nombre'].lower() or query.lower() in profesor['Apellidos'].lower():
            # Aquí se obtiene el total de días asignados, como ya se discutió
            total_dias = contar_dias_profesor(
                profesor['Horario'])  # Asegúrate de que esta función existe y calcule correctamente
            resultados.append({
                'Nombre': profesor['Nombre'],
                'Apellidos': profesor['Apellidos'],
                'horas_asignadas': total_dias
            })

    return jsonify({'resultados': resultados})


# Ruta para manejar el formulario
@app.route('/submit-form', methods=['POST'])
def submit_form():
    nombre = request.form.get('nombre', '').strip()
    apellidos = request.form.get('apellidos', '').strip()
    dias = request.form.getlist('dias[]')

    # Construcción del diccionario de horarios
    horarios = {
        dia: request.form.getlist(f'horas[{dia}][]')
        for dia in dias if request.form.getlist(f'horas[{dia}][]')
    }

    # Validación de datos
    if not nombre or not apellidos or not dias or not horarios:
        return jsonify({'error': 'Todos los campos son obligatorios'}), 400

    horarios_json = json.dumps(horarios)

    try:
        db.upload_data(nombre, apellidos, horarios_json)
        return jsonify({'message': 'Datos guardados correctamente'}), 200
    except mysql.connector.Error as e:
        return jsonify({'error': f'Error al guardar en la base de datos: {str(e)}'}), 500


def contar_dias_profesor(profesores):
    """
    Toma una lista de diccionarios con la clave 'Horario' (en formato JSON)
    y devuelve un diccionario con el nombre del profesor y la cantidad de días asignados.
    """
    resultado = {}

    for profesor in profesores:
        nombre_completo = f"{profesor['Nombre']} {profesor['Apellidos']}"
        horario = json.loads(profesor['Horario'])  # Convertir el string JSON a diccionario
        dias_asignados = len(horario)  # Contar las claves (días) en el JSON

        resultado[nombre_completo] = dias_asignados

    return resultado


# Ejecución de la aplicación
if __name__ == '__main__':
    app.run(debug=True)
