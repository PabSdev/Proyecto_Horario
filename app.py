from flask import Flask, render_template, request, redirect, url_for
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
    nombre = request.form['nombre']
    apellidos = request.form['apellidos']

    if nombre and apellidos:
        db.upload_data(nombre, apellidos)
    return redirect(url_for('Form'))

        
    
    
@app.route('/Dashboard')
def dashboard():
    return render_template('dashboard.html')


if __name__ == '__main__':
    app.run()
