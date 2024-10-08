import subprocess

class CLI:
    def run(self, command):
        sub = subprocess.Popen(command, stdout = subprocess.PIPE, stderr = subprocess.PIPE)
        sub.wait()
        
        output, error = sub.communicate()
        if sub.returncode != 0:
            print(f"Error: {error}")
            return None
        else:
            return output.decode("utf-8")
    
    def speedtest(self):
        return self.run(['speedtest', '--json'])
    
    def ping(self):
        try:
            answer = self.run(['ping', '-c', '1', 'speedtest.net'])
            if 'received' in answer:
                return True
            else:
                return False
        except:
            return False