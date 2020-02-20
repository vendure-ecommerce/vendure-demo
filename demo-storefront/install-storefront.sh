#!/usr/bin/env bash
cd "${0%/*}"
git clone https://github.com/vendure-ecommerce/storefront.git
cd storefront
git checkout 558545db3a2fa3012b4fa0f22412600e38f4c708
yarn
yarn build:ssr
