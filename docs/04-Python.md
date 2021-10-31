# Python


## Installare i requirements

```
flask 
flask_sqlalchemy
requests
sqlalchemy-utils
pyodbc
opentelemetry-api
opentelemetry-sdk
opentelemetry-instrumentation-flask
opentelemetry-instrumentation
opentelemetry-instrumentation-sqlalchemy
opentelemetry-instrumentation-requests
opentelemetry-exporter-zipkin
```

## Applicazione
```py
from flask import Flask
from flask import request
from flask import jsonify, abort
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database
from opentelemetry import trace
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.exporter.zipkin.json import ZipkinExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

trace.set_tracer_provider(
    TracerProvider(
        resource=Resource.create({SERVICE_NAME: "store"})
    )
)
zipkin_exporter = ZipkinExporter(
    endpoint="http://zipkin:9411/api/v2/spans",
)
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(zipkin_exporter)
)
tracer = trace.get_tracer(__name__)

app = Flask(__name__)
FlaskInstrumentor().instrument_app(app)
RequestsInstrumentor().instrument()
connectionString = "mssql+pyodbc://sa:m1Password[12J@sqlserver/Store?driver=ODBC+Driver+17+for+SQL+Server"
app.config['SQLALCHEMY_DATABASE_URI'] = connectionString

from models import db, Store, metadata

try:
    engine = create_engine(connectionString)
    if not database_exists(engine.url):
        create_database(engine.url)
        metadata.create_all(engine)
        print('Create database!')
except:
    print('Create database error!')

SQLAlchemyInstrumentor().instrument(
    engine=engine,
)

db.init_app(app)

@app.route('/store/', methods = ['GET'])
def GetAllStore():
    result = db.session.query(Store).all()
    return jsonify([{"productId":r.productId, "availability":r.availability} for r in result])

@app.route('/store/<productId>')
def GetProductAvailability(productId):
    result = db.session.query(Store).filter_by(productId=productId).one_or_none()
    if result:
        return jsonify({"productId":result.productId, "availability":result.availability})
    else:
        abort(404)

@app.route('/store/', methods = ['POST'])
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
```

Aggiungere il models per SQL

```py
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, create_engine
from sqlalchemy.ext.declarative import declarative_base

metadata = MetaData()
Base = declarative_base(metadata=metadata)
db = SQLAlchemy(metadata=metadata)

class Store(db.Model):
    __tablename__ = "Store"
    productId = db.Column(db.Integer, primary_key=True)
    availability = db.Column(db.Numeric, nullable=False)
    def __repr__(self):
        return '<ProductStore %r>' % self.productId
```

# DockerFile
```
# Use an official Python runtime as a parent image
FROM python:3.9-slim-buster

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
ADD . /app

# install Microsoft SQL Server requirements.
ENV ACCEPT_EULA=Y
RUN apt-get update -y && apt-get update \
  && apt-get install -y --no-install-recommends curl gcc g++ gnupg unixodbc-dev

# Add SQL Server ODBC Driver 17 for Ubuntu 18.04
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
  && curl https://packages.microsoft.com/config/debian/10/prod.list > /etc/apt/sources.list.d/mssql-release.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends --allow-unauthenticated msodbcsql17 mssql-tools \
  && echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bash_profile \
  && echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# Run app.py when the container launches
CMD ["python", "app.py", "run", "--no-debugger","--port", "600"]
EXPOSE 600
```
