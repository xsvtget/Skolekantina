from flask import Flask, render_template, request, redirect, session, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = "nbQ&UdC%TwrmU#Z9WG2n3nY2tc4@f$fUay@MDmy?qg??3v*tSHyfR4qjMMnM8aJD"

app.config["SQLALCHEMY_DATABASE_URI"] = "mariadb+mariadbconnector://Oleksandr:root@10.0.0.85:3308/Skolekantina"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


@app.route("/")
def home():
    username = "gigachad"
    return render_template("index.html", username=username)



if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=8245, debug=True)