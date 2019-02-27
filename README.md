# Vendure Demo

This is a demo project used as the basis for the online Vendure demo. The index.js script populates the server using the Vendure CLI `populate` command, and then caches the generated pristine data. Every hour, this cached data is restored to reset any changes which have been made to the server instance in that time.

## Running Locally

To run locally, install dependencies with `yarn` and then run the script with `node index.js`.

## Running in Docker

There is a bundled Dockerfile which allows the app to be run in a Docker container.

```bash
docker build -t vendure-demo .
```

```bash
docker run --name vendure -p 3000:3000 -d vendure-demo
```
