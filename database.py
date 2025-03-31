import mysql.connector

# Conexión a la base de datos
# Establece la conexión con la base de datos MySQL en AWS RDS
# Asegúrate de que las credenciales sean correctas y seguras

database = mysql.connector.connect(
    host='horarios.cctsgukqoa4l.us-east-1.rds.amazonaws.com',
    user='admin',
    password='321Tiempo',
    database='Horarios',
    port=3306
)

# Función para insertar datos en la BD
def upload_data(nombre, apellidos, ciclo, horario):
    """
    Inserta un nuevo profesor en la base de datos con su nombre, apellidos,
    ciclo y horarios.
    """
    if verificar_profesor(nombre, apellidos):
        return {'error': 'El profesor ya está registrado.'}

    try:
        with database.cursor() as cursor:
            cursor.execute(
                "INSERT INTO Profesores (Nombre, Apellidos, Ciclo, Horarios) VALUES (%s, %s, %s, %s)",
                (nombre, apellidos, ciclo, horario),
            )
            database.commit()
        return {'message': 'Datos insertados correctamente.'}
    except mysql.connector.Error as err:
        return {'error': f'Error de MySQL: {err}'}


# Función para obtener los datos de los profesores
def get_data():
    """
    Recupera todos los datos de la tabla Profesores.
    Devuelve una lista de diccionarios con la información de cada profesor.
    """
    try:
        with database.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT * FROM Profesores")
            profesores = cursor.fetchall()
        return profesores
    except mysql.connector.Error as err:
        print(f"❌ Error al obtener datos: {err}")
        return []  # Retorna una lista vacía si hay un error

# Función para contar el número de profesores registrados
def get_profesores():
    """
    Devuelve el número total de profesores en la base de datos.
    """
    try:
        with database.cursor() as cursor:
            cursor.execute("SELECT COUNT(id) FROM Profesores")
            profesores = cursor.fetchone()[0]  # Obtiene solo el número total
        return profesores
    except mysql.connector.Error as err:
        print(f"❌ Error al contar profesores: {err}")
        return 0  # Devuelve 0 si hay un error

# Función para buscar profesores en la base de datos
def search_profesor(search_query=""):
    """
    Busca profesores en la base de datos filtrando por nombre o apellidos.
    Si no se proporciona una consulta de búsqueda, devuelve todos los registros.
    """
    try:
        with database.cursor(dictionary=True) as cursor:
            if search_query:
                # Usar parámetros para evitar inyección SQL
                query = "SELECT * FROM Profesores WHERE Nombre LIKE %s OR Apellidos LIKE %s"
                search_param = f"%{search_query}%"
                cursor.execute(query, (search_param, search_param))
            else:
                cursor.execute("SELECT * FROM Profesores")
            profesores = cursor.fetchall()
        return profesores
    except mysql.connector.Error as err:
        print(f"❌ Error al buscar profesores: {err}")
        return []

def verificar_profesor(nombre, apellidos):
    """
    Verifica si un profesor con el nombre y apellidos proporcionados existe en la base de datos.
    Devuelve True si el profesor existe, False en caso contrario.
    """
    try:
        with database.cursor() as cursor:
            cursor.execute(
                "SELECT Nombre, Apellidos FROM Profesores WHERE Nombre = %s AND Apellidos = %s",        
                (nombre, apellidos)  # Usamos parámetros de consulta
            )
            resultado = cursor.fetchone()
            return resultado is not None
    except mysql.connector.Error as err:
        print(f"❌ Error al verificar profesor: {err}")
        return False
