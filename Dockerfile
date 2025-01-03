FROM node:20-alpine
WORKDIR /app
ARG NEXT_PUBLIC_VERSION
ENV NEXT_PUBLIC_VERSION=$NEXT_PUBLIC_VERSION
COPY . ./
RUN npm ci 
RUN npm run build
RUN npm prune --production
EXPOSE 3000
CMD ["npm", "start"]