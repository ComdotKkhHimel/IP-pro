from flask import Flask, render_template, jsonify
import socket
import requests
import time

app = Flask(__name__)
LOG_FILE = "ip_log.txt"

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "Unavailable"

def get_public_ip():
    try:
        return requests.get("https://api.ipify.org").text
    except:
        return "Unavailable"

def log_ips(local_ip, public_ip):
    with open(LOG_FILE, "a") as f:
        f.write(f"{time.ctime()} | Local: {local_ip} | Public: {public_ip}\n")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/ip")
def api_ip():
    local_ip = get_local_ip()
    public_ip = get_public_ip()
    log_ips(local_ip, public_ip)
    return jsonify({
        "local_ip": local_ip,
        "public_ip": public_ip,
        "time": time.ctime()
    })

@app.route("/api/log")
def api_log():
    try:
        with open(LOG_FILE, "r") as f:
            logs = f.readlines()[-20:]
        return jsonify({"logs": logs})
    except:
        return jsonify({"logs": ["No logs available."]})

if __name__ == "__main__":
    app.run(debug=True)