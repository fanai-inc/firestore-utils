FROM node:8.11.3
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn
COPY . /app
EXPOSE 3000
CMD ["sh", "-c", "node index.js export ${databaseURL} ${serviceConfigPath}"]