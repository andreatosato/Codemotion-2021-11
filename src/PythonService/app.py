from flask import Flask
from flask import request
from flask import jsonify, abort
from opentelemetry.instrumentation.flask import FlaskInstrumentor

app = Flask(__name__)
FlaskInstrumentor().instrument_app(app, excluded_urls="client/.*/info,healthcheck")
app.config['SQLALCHEMY_DATABASE_URI'] = "mssql+pyodbc://sa:m1Password@12J@sqlserver" #'Server=sqlserver;Database=AvailabilityDB;UserId=sa;Password=m1Password@12J;'
# connection_string = "DRIVER={SQL Server Native Client 10.0};SERVER=dagger;DATABASE=test;UID=user;PWD=password" 

from models import db, Store

db.init_app(app)

@app.route('/')
def GetAllStore():
    result = db.session.query(Store).all()
    return jsonify([{"productId":r.productId, "availability":r.availability} for r in result])

@app.route('/<productId>')
def GetProductAvailability(productId):
    result = db.session.query(Store).filter_by(productId=productId).one_or_none()
    if result:
        return str(result)
    else:
        abort(404)

@app.route('/set/<productId>', methods = ['POST'])
def SetProductAvailability():
    productAvailability = request.get_json()
    productId = productAvailability["productId"]
    availability = productAvailability["availability"]
    find = db.session.query(Store).filter_by(productId=productId).one_or_none()
    if find: 
        find.productId = productId
        find.availability = availability
    else:
        find = Store(productId = productId, availability = availability)

    db.session.add(find)
    db.session.commit()
    return jsonify({"Message": "Ok"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=600)