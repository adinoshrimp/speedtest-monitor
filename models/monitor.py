import schedule
import time
import json
from dotenv import load_dotenv
import os

from models.db import DB
from models.cli import CLI


class Monitor:
    def __init__(self):
        self.cli = CLI()
        DB().initialize()
    
    def scan(self):
        print("new scan:", time.strftime("%H:%M:%S"))
        content = []
        json_data = self.cli.speedtest()
        data = json.loads(json_data)
        DB().addSpeedtestEntry(data["download"], data["upload"], data["ping"], data["timestamp"], data["server"]["id"], data["server"]["name"], data["server"]["sponsor"], data["server"]["host"], data["server"]["country"], data["server"]["lat"], data["server"]["lon"])
        print("Scan complete")
    
    def run(self):
        load_dotenv()
        scan_interval = int(os.getenv('SCAN_INTERVAL'))
        print("Scan every", str(scan_interval), "min")
        schedule.every(scan_interval).minutes.do(self.scan)
        
        while True:
            schedule.run_pending()
            time.sleep(1)