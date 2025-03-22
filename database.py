import mysql.connector

# Conexión a la base de datos
database = mysql.connector.connect(
    host='localhost',
    user='root',
    password='1234567890',
    database='Horarios',
    port=3307
)

mycursor = database.cursor()

# Función para insertar datos en la BD
def upload_data(nombre, apellidos, Horario):
    try:
        mycursor.execute(
            'INSERT INTO profesores (nombre, Apellidos, Horario) VALUES (%s, %s, %s)',
            (nombre, apellidos, Horario)
        )
        database.commit()
        print("✅ Datos insertados correctamente en la base de datos.")
        return 'Data uploaded successfully'
    except mysql.connector.Error as err:
        print(f"❌ Error de MySQL: {err}")
        return f'Error: {err}'
