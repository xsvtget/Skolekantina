from flask import Flask, render_template, request, redirect, session, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = "nbQ&UdC%TwrmU#Z9WG2n3nY2tc4@f$fUay@MDmy?qg??3v*tSHyfR4qjMMnM8aJD"

app.config["SQLALCHEMY_DATABASE_URI"] = "mariadb+mariadbconnector://Oleksandr:root@10.0.0.85:3308/Skolekantina"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(25), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Meny_uke(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    uke = db.Column(db.String(200))
    mandag = db.Column(db.String(200))
    tirsdag = db.Column(db.String(200))
    onsdag = db.Column(db.String(200))
    torsdag = db.Column(db.String(200))
    fredag = db.Column(db.String(200))

@app.route("/")
def home():
    if "username" in session:
        return redirect(url_for('liena'))
    return render_template("/martynas_log_in/martynas.html")

@app.route("/login", methods=['POST'])
def login():
    user = request.form["brukernavn"]
    password = request.form["passord"]
    
    username = Users.query.filter_by(username=username).first()
    if username and username.check_password(password):
        session["username"] = user
        return redirect(url_for("vika_screen"))
    else:
        return render_template("/martynas_log_in/martynas.html")
    
    
    
@app.route("/register", methods=["POST"])
def register():
    user = request.form["username"]
    password = request.form["passord"]
    username = Users.query.filter_by(username=username).first()
    if username:
        return render_template("/martynas_log_in/martynas_sign_in.html", error="This user already exist!")
    else:
        new_user = Users(username=username)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        session["username"] = user
        return redirect(url_for("home"))

@app.route("/registration")
#register page route
def register_page():
    return render_template("/martynas_log_in/martynas_sign_in.html")

    
    
@app.route("/vika_screen")
def vika_screen():
    return render_template("/vika_screen/index.html")

@app.route("/liena")
def liena():
    return render_template("/liena-website/index.html")



if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=8245, debug=True)