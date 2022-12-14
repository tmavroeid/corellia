FROM node:lts-alpine as corellia
COPY package.json app/
COPY common/* app/common/
COPY funder.js app/
WORKDIR app/
RUN npm install
CMD ["npm", "run", "funding"]