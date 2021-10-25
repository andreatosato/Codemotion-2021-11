# Docker-Compose
Per lanciare la soluzione, è necessario mergiare i file docker-compose e i vari file di override
Portarsi nella cartella SRC

```
docker-compose -f docker-compose.yml -f docker-compose.override.yml -p Codemotion-2021 up -d --build
```

Per ignorare la console possiamo aggiungere `-d`.