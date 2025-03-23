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
def upload_data(nombre, apellidos, horario):
    try:
        with database.cursor() as cursor:
            cursor.execute(
                'INSERT INTO profesores (Nombre, Apellidos, Horario) VALUES (%s, %s, %s)',
                (nombre, apellidos, horario)
            )
            database.commit()
        print("✅ Datos insertados correctamente en la base de datos.")
    except mysql.connector.Error as err:
        print(f"❌ Error de MySQL: {err}")


# Función para obtener los datos de los profesores
def get_data():
    try:
        with database.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT * FROM profesores")
            profesores = cursor.fetchall()
        return profesores
    except mysql.connector.Error as err:
        print(f"❌ Error al obtener datos: {err}")
        return []  # Retorna una lista vacía si hay un error


# Función para contar el número de profesores
def get_profesores():
    try:
        with database.cursor() as cursor:
            cursor.execute("SELECT COUNT(id) FROM profesores")
            profesores = cursor.fetchone()[0]  # Obtiene solo el número
        return profesores
    except mysql.connector.Error as err:
        print(f"❌ Error al contar profesores: {err}")
        return 0  # Devuelve 0 si hay un error


def search_profesor(search_query=""):
    try:
        with database.cursor(dictionary=True) as cursor:
            if search_query:
                cursor.execute(
                    f"SELECT * FROM profesores WHERE Nombre LIKE '%{search_query}%' OR Apellidos LIKE '%{search_query}%'")
            else:
                cursor.execute("SELECT * FROM profesores")
            profesores = cursor.fetchall()
        return profesores
    except mysql.connector.Error as err:
        print(f"❌ Error al obtener datos: {err}")
        return []
