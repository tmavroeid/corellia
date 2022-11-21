FROM node:lts-alpine as porg
COPY package.json app/
COPY common/* app/common/
COPY funder.js app/
WORKDIR app/
RUN npm install
CMD ["npm", "run", "funding"]