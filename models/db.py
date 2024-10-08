import sqlite3

class DB:
    def __init__(self):
        self.conn = sqlite3.connect("data.db")
        self.cursor = self.conn.cursor()
    
    def execute(self, query, params = None):
        try:
            if params is not None:
                self.cursor.execute(query, params)
            else:
                self.cursor.execute(query)
            self.conn.commit()
            return self.cursor.fetchall()
        except sqlite3.Error as e:
            print(f"DB Error: {e} - {query} params: {params}")
            return None
    
    def initialize(self):
        queries = [ """
            CREATE TABLE IF NOT EXISTS servers (
                id INTEGER PRIMARY KEY,
                name TEXT,
                company TEXT,
                host TEXT,
                country TEXT,
                lat INTEGER,
                lon INTEGER
            );
        """,
        """
            CREATE TABLE IF NOT EXISTS speedtests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                server_id INTEGER,
                download INTEGER,
                upload INTEGER,
                ping INTEGER,
                server_timestamp TEXT,
                timestamp NOT NULL DEFAULT (datetime('now', '+2 hours')),
                FOREIGN KEY (server_id) REFERENCES servers(id)
            );
        """ ]
        for query in queries:
            self.execute(query)
    
    def getLastId(self, table):
        query = f"SELECT MAX(id) FROM {table}"
        ids = self.execute(query)
        if ids:
            return ids[0][0]
        return None
    
    def getServerId(self, id, name, company, host, country, lat, lon):
        query = "SELECT id FROM servers WHERE id = ?"
        params = (id,)
        ids = self.execute(query, params)
        if ids:
            return ids[0][0]
        self.addServer(id, name, company, host, country, lat, lon)
        return self.getLastId("servers")
    
    def getCat(self, cat, start_id, amount=12):
        if not start_id:
            start_id = self.getLastId("speedtests")
        query = f"SELECT id, {cat}, timestamp FROM speedtests WHERE id <= ? ORDER BY id DESC LIMIT ?"
        params = (start_id, amount)
        content = self.execute(query, params)
        if content:
            return content
        return None
    
    def getInfo(self, id):
        query = """
            SELECT st.download, st.upload, st.ping, st.timestamp,
                    s.id, s.name, s.company, s.host, s.country, s.lat, s.lon
            FROM servers s
            JOIN speedtests st ON s.id = st.server_id
            WHERE st.id = ?;
        """
        params = (id,)
        content = self.execute(query, params)
        if content:
            return content
        return None
    
    def addServer(self, id, name, company, host, country, lat, lon):
        query = "INSERT INTO servers (id, name, company, host, country, lat, lon) VALUES(?, ?, ?, ?, ?, ?, ?)"
        params = (id, name, company, host, country, lat, lon)
        self.execute(query, params)
    
    def addSpeedtest(self, server_id, download, upload, ping, server_timestamp):
        query = "INSERT INTO speedtests (server_id, download, upload, ping, server_timestamp) VALUES(?, ?, ?, ?, ?)"
        params = (server_id, download, upload, ping, server_timestamp)
        self.execute(query, params)
    
    def addSpeedtestEntry(self, download, upload, ping, server_timestamp, server_id, name, company, host, country, lat, lon):
        server_id = self.getServerId(server_id, name, company, host, country, lat, lon)
        self.addSpeedtest(server_id, download, upload, ping, server_timestamp)
        return self.getLastId("speedtests")
    
    def __del__(self):
        if self.conn:
            self.conn.close()