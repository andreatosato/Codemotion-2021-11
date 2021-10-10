from flask import Flask
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from sqlalchemy import Table, MetaData, Column, Integer, select

app = Flask(__name__)
FlaskInstrumentor().instrument_app(app, excluded_urls="client/.*/info,healthcheck")

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'
#db = SQLAlchemy(app)


# m = MetaData()
# t = Table('t', m,
#         Column('id', Integer, primary_key=True),
#         Column('x', Integer))
# m.create_all(engine)

# class Store(db.Model):
#     productId = db.Column(db.Integer, primary_key=True)
#     availability = db.Column(db.Integer, nullable=False)

#     def __repr__(self):
#         return '<ProductStore %r>' % self.productId

@app.route('/')
def GetAllStore():
    return 'Hello, World!'

@app.route('/:productId')
def GetProductAvailability():
    return 'Hello, World!'

@app.route('/:productId',)
def GetProductAvailability():
    return 'Hello, World!'

#app.run(host='0.0.0.0', port=6000)