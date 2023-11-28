FROM node:16
WORKDIR /app
COPY . ./
RUN npm set strict-ssl false
RUN npm config set update-notifier false
RUN rm -f package-lock.json
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]