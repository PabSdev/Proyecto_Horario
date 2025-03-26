from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from functools import wraps
import json
import database as db
import mysql.connector
from markupsafe import escape

# Configuración de la aplicación Flask
app = Flask(__name__)
app.debug = True 
app.secret_key = 'tu_clave_secreta_aqui'  # Cambiar por una clave segura en producción

# Decorador para proteger rutas (requiere que el usuario esté autenticado)
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'usuario' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Página de inicio
@app.route('/')
def landing_page():
    return render_template('index.html')

# Página de inicio de sesión
@app.route('/login')
def login():
    if 'usuario' in session:
        return redirect(url_for('dashboard'))  # Redirige si ya está autenticado
    return render_template('login.html')

# Cierre de sesión
@app.route('/logout')
def logout():
    session.pop('usuario', None)
    return redirect(url_for('login'))

# Verificación de credenciales del profesor
@app.route('/verificar-profesor', methods=['POST'])
def verificar_profesor():
    username = request.form.get('username', '').strip()
    password = request.form.get('password', '').strip()
    
    if not username or not password:
        return jsonify({'error': 'Usuario y contraseña son requeridos'}), 400
    
    usuario = db.get_admin(username, password)
    if usuario:
        session['usuario'] = username  # Guarda la sesión del usuario autenticado
        return jsonify({'status': 'success', 'redirect': url_for('dashboard')})
    
    return jsonify({'error': 'Usuario o contraseña incorrectos'}), 401

# Página principal del dashboard
@app.route('/dashboard')
@login_required
def dashboard():
    profesores = db.get_data()  # Obtiene la lista de profesores desde la BD
    total_profesores = len(profesores)  # Cuenta total de profesores
    dias_profesores = contar_dias_profesor(profesores)  # Calcula los días asignados a cada profesor

    return render_template('dashboard.html',
                           profesores=profesores,
                           total_profesores=total_profesores,
                           dias_profesores=dias_profesores)

# Búsqueda de profesores
@app.route('/buscar_profesor', methods=['GET'])
@login_required
def buscar_profesor():
    query = request.args.get('query', '').strip()
    profesores = db.search_profesor(query)  # Filtra los profesores según la búsqueda
    dias_profesores = contar_dias_profesor(profesores)

    # Formateo de los resultados de búsqueda
    resultados = [
        {
            'id': prof.get('id', ''),
            'Nombre': prof.get('Nombre', ''),
            'Apellidos': prof.get('Apellidos', ''),
            'dias_totales': dias_profesores.get(f"{prof['Nombre']} {prof['Apellidos']}", 0),
            'horas_asignadas': sum(len(json.loads(prof.get('Horario', '{}') or '{}').values())
                                   if prof.get('Horario') else 0)
        }
        for prof in profesores
    ]
    
    return jsonify(resultados)

# Procesamiento del formulario de asignación de horarios
@app.route('/submit-form', methods=['POST'])
@login_required
def submit_form():
    nombre = escape(request.form.get('nombre', '').strip())
    apellidos = escape(request.form.get('apellidos', '').strip())
    dias = request.form.getlist('dias[]')
    ciclo = request.form.get('ciclos')
    
    if not nombre or not apellidos or not dias:
        return jsonify({'error': 'Todos los campos son obligatorios'}), 400
    
    # Obtención y almacenamiento del horario en formato JSON
    horarios = {dia: request.form.getlist(f'horas[{dia}][]') for dia in dias if request.form.getlist(f'horas[{dia}][]')}
    horarios_json = json.dumps(horarios)
    
    try:
        db.upload_data(nombre, apellidos, ciclo, horarios_json)  # Sube los datos a la BD
        return jsonify({'message': 'Datos guardados correctamente'}), 200
    except IntegrityError:
        return jsonify({'error': 'El profesor ya existe en la base de datos'}), 400
    except mysql.connector.Error as e:
        return jsonify({'error': f'Error en la base de datos: {str(e)}'}), 500

# Función para contar los días asignados a cada profesor
def contar_dias_profesor(profesores):
    """Devuelve un diccionario con el número de días asignados a cada profesor."""
    return {
        f"{prof['Nombre']} {prof['Apellidos']}": len(json.loads(prof.get('Horario', '{}') or '{}'))
        for prof in profesores
    }

# Ejecución de la aplicación
if __name__ == '__main__':
    app.run(debug=True)
