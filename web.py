from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import time
import threading

from models.api import API

app = Flask(__name__, static_folder='public')
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

api = API()


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html', async_mode=socketio.async_mode)

@app.route('/api/get', methods=['GET'])
def api_get():
    cat = request.args.get('cat')
    start_id = request.args.get('id')
    return api.get(cat, start_id)

@app.route('/api/get/info', methods=['GET'])
def api_getInfo():
    id = request.args.get('id')
    return api.getInfo(id)

@app.route('/api/ping', methods=['GET'])
def api_ping():
    return api.ping()

@socketio.on('connect')
def handle_connect():
    print("client connected")

@socketio.on('disconnect')
def handle_disconnect():
    print("client disconnected")

@socketio.on('message')
def handle_message(message):
    print('message:', message)
    if message == 'clap':
        emit('message', message, broadcast=True, include_self=False)

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000)