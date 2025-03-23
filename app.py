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
    return render_template('dashboard.html', profesores=profesores)



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


# Ejecución de la aplicación
if __name__ == '__main__':
    app.run(debug=True)
