FROM node:16
WORKDIR /app
COPY . ./
RUN npm set strict-ssl false
RUN npm config set update-notifier false
RUN npm install --production
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]