FROM node:10
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
RUN npm install pm2 -g --unsafe-perm
COPY package.json ./
COPY yarn.lock ./
USER node
RUN yarn
COPY --chown=node:node . .
RUN demo-storefront/install-storefront.sh
EXPOSE 3000
CMD [ "pm2-runtime", "index.js" ]
