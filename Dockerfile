FROM node:20-alpine
WORKDIR /app
ARG NEXT_PUBLIC_VERSION
ENV NEXT_PUBLIC_VERSION=$NEXT_PUBLIC_VERSION
COPY . ./
RUN npm i 
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]