from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def landing_page():
    return render_template('index.html')


@app.route('/Form')
def form():
    return render_template('Form.html')

@app.route('/submit-form', methods=['POST'])
def submit_form():
    nombre = request.form['Nombre']
    apellidos = request.form['Apellidos']
    
    dias = {}
    
    for dias in dias_seleccionados:
        horas_key = f'horas[{dia}][]'
        horas = request.form.getlist(horas_key)
        horario[dia] = horas
        
    for horario, dias in horario.items():
        for hora in horas:
            print(f'Dia: {dia}, Hora: {hora}')

@app.route('/Dashboard')
def dashboard():
    return render_template('dashboard.html')


if __name__ == '__main__':
    app.run()
