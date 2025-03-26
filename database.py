import mysql.connector

# Conexión a la base de datos
database = mysql.connector.connect(
    host='localhost',
    user='root',
    password='1234567890',
    database='Horarios',
    port=3307
)


# Función para insertar datos en la BD
def upload_data(nombre, apellidos, ciclo, horario):
    try:
        with database.cursor() as cursor:
            cursor.execute(
                'INSERT INTO Profesores (Nombre, Apellidos, Ciclo, Horarios) VALUES (%s, %s, %s, %s)',
                (nombre, apellidos, ciclo, horario)
            )
            database.commit()
        print("✅ Datos insertados correctamente en la base de datos.")
    except mysql.connector.Error as err:
        print(f"❌ Error de MySQL: {err}")

def get_admin():
    try:
        with database.cursor() as cursor:
            cursor.execute(
                "SELECT usuario, contrasena FROM usuario"
            )
            usuario = cursor.fetchall()
            return usuario
    except mysql.connector.Error as err:
        print(f"❌ Error de MySQL: {err}")




# Función para obtener los datos de los profesores
def get_data():
    try:
        with database.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT * FROM Profesores")
            profesores = cursor.fetchall()
        return profesores
    except mysql.connector.Error as err:
        print(f"❌ Error al obtener datos: {err}")
        return []  # Retorna una lista vacía si hay un error


# Función para contar el número de profesores
def get_profesores():
    try:
        with database.cursor() as cursor:
            cursor.execute("SELECT COUNT(id) FROM Profesores")
            profesores = cursor.fetchone()[0]  
    except mysql.connector.Error as err:
        print(f"❌ Error al contar profesores: {err}")
        return 0  

def search_profesor(search_query=""):
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