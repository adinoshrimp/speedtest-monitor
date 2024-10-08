from flask import jsonify

from models.db import DB
from models.cli import CLI

class API:
    def __init__(self):
        self.lastid = 0
    
    def isNew(self):
        newId = DB().getLastId("speedtests")
        if newId > self.lastid:
            return True
        return False

    def get(self, cat, start_id, amount=12):
        if cat not in ["upload", "ping"]:
            cat = "download"
        answer = DB().getCat(cat, start_id)
        if not answer:
            answer = []
        content = answer[::-1]
        result = {
            "cat": cat,
            "amount": amount,
            "data": [{"id": id, "data": value, "timestamp": timestamp} for id, value, timestamp in content],
        }
        return jsonify(result)
    
    def getInfo(self, id):
        lastId = int(DB().getLastId("speedtests"))
        if int(id) <= lastId:
            answer = DB().getInfo(id)
            content = answer[0]
            result = {
                "id": id,
                "last_id": lastId,
                "download": content[0],
                "upload": content[1],
                "ping": content[2],
                "timestamp": content[3],
                "server_id": content[4],
                "server_name": content[5],
                "server_company": content[6],
                "server_host": content[7],
                "server_country": content[8],
                "server_lat": content[9],
                "server_lon": content[10]
            }
        else:
            result = {
                "status": "error"
            }
        
        return jsonify(result)
    
    def ping(self):
        answer = CLI().ping()
        result = {"online": answer}
        return jsonify(result)