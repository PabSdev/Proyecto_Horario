from flask import Flask, render_template, request, jsonify, json
import database as db

app = Flask(__name__)

app.config['Debug'] = True


@app.route('/')
def landing_page():
    return render_template('index.html')


@app.route('/Form')
def form():
    return render_template('Form.html')


@app.route('/submit-form', methods=['POST'])
def submit_form():
    nombre = request.form.get('nombre', '').strip()
    apellidos = request.form.get('apellidos', '').strip()
    dias = request.form.getlist('dias[]')


    horarios = {}

    for dia in dias:
        horas_seleccionadas = request.form.getlist(f'horas[{dia}][]')
        if horas_seleccionadas:
            horarios[dia] = horas_seleccionadas

    if not nombre or not apellidos or not dias or not horarios:
        return jsonify({'error': 'Todos los campos son obligatorios'}), 400


    horarios_json = json.dumps(horarios)

    try:
        db.upload_data(nombre, apellidos, horarios_json)
        return jsonify({'message': 'Datos guardados correctamente'}), 200
    except Exception as e:
        return jsonify({'error': f'Error al guardar en la base de datos: {str(e)}'}), 500


@app.route('/Dashboard')
def dashboard():
    return render_template('dashboard.html')


if __name__ == '__main__':
    app.run(Debug=True)
