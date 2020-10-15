# Vendure Demo

This is a demo project used as the basis for the online Vendure demo. The src/index.ts script populates the server using the Vendure CLI `populate` command, and then caches the generated pristine data. Every day, this cached data is restored to reset any changes which have been made to the server instance in that time.

## Storefront

The storefront is fetched from an Amazon S3 bucket which contains build artifacts from the [vendure-storefront](https://github.com/vendure-ecommerce/storefront/) project. The version of the storefront app can be set in the following line in the dockerfile:

```
RUN ["./install-storefront.sh", "vX.Y.Z"]
```

This version should match one of the [storefront release tags](https://github.com/vendure-ecommerce/storefront/releases) 

## Running Locally

To run locally, install dependencies with `yarn` and then run the script with `yarn start`.

## Running in Docker

There is a bundled Dockerfile which allows the app to be run in a Docker container.

```bash
docker build -t vendure-demo .
```

```bash
docker run --name vendure -p 3000:3000 -d vendure-demo
```

## Deploying

The demo is being deployed to a Digital Ocean server running [Dokku](https://github.com/dokku/dokku) at [https://demo.vendure.io](https://demo.vendure.io). 

See [Host your Node app on Dokku & DigitalOcean](https://medium.com/@pimterry/host-your-node-app-on-dokku-digitalocean-1cb97e3ab041) for a guide to how this was set up.

To deploy changes after commit use this command:

```bash
git push dokku master
```
