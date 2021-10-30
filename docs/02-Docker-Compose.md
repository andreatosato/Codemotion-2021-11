# 02 Docker-Compose
Per lanciare la soluzione, è necessario mergiare i file docker-compose e i vari file di override
Portarsi nella cartella SRC

```
docker-compose -f docker-compose.yml -f docker-compose.override.yml -p Codemotion-2021 up -d --build
```

Per ignorare la console possiamo aggiungere `-d`.

Il file completo è il seguente:

```yaml
services:
  # ingress
  envoy:
    container_name: envoy
    image: envoyproxy/envoy-alpine:v1.20-latest
    depends_on:
        - orders
        - products
        - store
        - zipkin
  
  # aggregator
  aggregator:
    container_name: aggregator
    image: opentelemetry/aggregator
    build:
      context: .
      dockerfile: Aggregator/Dockerfile
    depends_on:
        - orders
        - products
        - store
        - zipkin
  
  # microservices
  orders:
    container_name: orders
    image: opentelemetry/orders
    build:
      context: .
      dockerfile: DotNetService/Dockerfile
    depends_on:
        - sqlserver
        - zipkin

  products:
    container_name: products
    image: opentelemetry/products
    build:
      context: ./NodeService
      dockerfile: Dockerfile
    depends_on:
        - mongodb
        - zipkin

  store:
    container_name: store
    image: opentelemetry/store
    build:
      context: ./PythonService
      dockerfile: Dockerfile
    depends_on:
        - sqlserver
        - zipkin
  
  # Databases
  mongodb:
    container_name: mongodb
    image: mongo:latest
    volumes:
      - mongodata:/data/db

  sqlserver:
    container_name: sqlserver
    image: "mcr.microsoft.com/mssql/server"    
    volumes:
      - sqlserverdata:/var/lib/sqlserver
  # Databases


  # OpenTelemetry
  zipkin:
    container_name: zipkin
    image: openzipkin/zipkin

  # OpenTelemetry

volumes:
  sqlserverdata:
    driver: local
  mongodata:
    driver: local
```

### Override
In questo file sono state esposte porte che non dovrebbero essere esposte normalmente proprio per testare i singoli servizi mentre svolgiamo il laboratorio.
```yaml
services:
  envoy:
    volumes:
        - ./Ingress:/etc/envoy
    ports:
        - "10000:10000"
        - "9901:9901"

  aggregator:
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=http://+:2000
      - ProductApi=http://products:5000/
      - StoreApi=http://store:600/
      - OrderApi=http://orders:4000/
      - ZipkinExporter=http://zipkin:9411/
    ports:
      - "2000:2000"

  orders:
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=http://+:4000
      - ConnectionStrings__SqlConnection=Data Source=sqlserver;Database=Orders;User Id=sa;Password="m1Password[12J";
      - ZipkinExporter=http://zipkin:9411/
    ports:
      - "4000:4000"


  products:
    environment:
      - MONGO_INITDB_ROOT_USERNAME=root
      - MONGO_INITDB_ROOT_PASSWORD=example
    ports:
      - "5000:5000"

  store:
    environment:
        - FLASK_APP=app.py
        - FLASK_ENV=development
    ports:
      - "600:600"

  # Only for inspect data
  mongodb:
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
    ports:
      - "27017:27017"
 
  sqlserver:
    ports:
        - 1433:1433
    environment:
        SA_PASSWORD: "m1Password[12J"
        ACCEPT_EULA: "Y"
    mem_limit: 4G

  # OpenTelemetry
  zipkin:
    ports:
    - 9411:9411
```