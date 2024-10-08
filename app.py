import threading
import eventlet
from eventlet import wsgi
from dotenv import load_dotenv
import os

from models.monitor import Monitor
from web import app

def run_webui():
    load_dotenv()
    port = int(os.getenv('WEBGUI_PORT'))
    wsgi.server(eventlet.listen(('0.0.0.0', port)), app)


monitor = Monitor()

webgui_thread = threading.Thread(target=run_webui)
webgui_thread.daemon = True
webgui_thread.start()
monitor.run()