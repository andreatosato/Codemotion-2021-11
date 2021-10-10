1. Install Python
2. Install pip
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python get-pip.py

3. Crea file app.py
4. Crea Virtual Env
py -3 -m venv venv
venv\Scripts\activate.bat


5. Install:
pip install flask
pip install SQLAlchemy

pip install opentelemetry-api
pip install opentelemetry-sdk

https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation

pip install opentelemetry-instrumentation-flask
pip install opentelemetry-instrumentation-sqlalchemy