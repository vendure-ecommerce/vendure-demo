FROM node:10
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package.json ./
COPY yarn.lock ./
USER node
RUN yarn
COPY --chown=node:node . .
EXPOSE 80
CMD [ "yarn", "start" ]
