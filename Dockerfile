FROM node:20
WORKDIR /app
COPY . ./
# RUN npm config set update-notifier false
# RUN rm -f package-lock.json
RUN npm install
RUN npm run build
RUN npx prisma migrate dev --name init
EXPOSE 3000
CMD ["npm", "start"]