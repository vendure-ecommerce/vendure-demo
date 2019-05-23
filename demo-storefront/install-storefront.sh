#!/usr/bin/env bash
# Not currently used because building the storefront takes up
# too much memory for the basic DigitalOcean droplet it is hosted on.
cd "${0%/*}"
git clone https://github.com/vendure-ecommerce/storefront.git
cd storefront
git checkout 4c9e8f178d88b2fe561a013e2b5ecafc4d0d7c83
yarn
cd projects/storefront
yarn
cd ../..
yarn lib:build
yarn ng build --prod --baseHref=/storefront/
yarn ng run reference-storefront:server:production
yarn compile:server
