#!/usr/bin/env bash
cd "${0%/*}"
curl https://vendure-storefront-artifacts.s3.eu-central-1.amazonaws.com/vendure-storefront-build.zip -L -o storefront.zip
unzip storefront.zip
