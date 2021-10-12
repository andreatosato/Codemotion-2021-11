# Use an official Python runtime as a parent image
FROM python:3.10-slim-buster

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
ADD . /app

# Install requirements on OS
RUN apt-get update
RUN pip3 install --upgrade pip
RUN apt-get --assume-yes update
RUN apt-get --assume-yes install freetds-dev freetds-bin  
RUN apt-get --assume-yes install python-dev python-pip  
RUN apt-get clean -y

# Install any needed packages specified in requirements.txt
RUN pip --verbose install -r requirements.txt

# Run app.py when the container launches
CMD ["python", "App.py"]