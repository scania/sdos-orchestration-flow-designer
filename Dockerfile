FROM node:16
WORKDIR /app
ARG NEXT_PUBLIC_API_BASE_URL
# Set the environment variable from the build argument (required for static content)
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
COPY . ./
RUN npm set strict-ssl false
RUN npm config set update-notifier false
RUN rm -f package-lock.json
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]