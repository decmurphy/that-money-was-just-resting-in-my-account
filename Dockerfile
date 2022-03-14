# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:14 as build

# Set the working directory
WORKDIR /usr/local/app
# RUN chown node:node ./
# USER node

# Install dependencies first, as they change less often than code.
COPY package.json package-lock.json* ./

# Defaults to production, docker-compose overrides this to development on build and run.
# ARG NODE_ENV=production
# ENV NODE_ENV $NODE_ENV

# Install all the dependencies
RUN npm i && npm cache clean --force
# RUN npm i @angular/cli

# Add the source code to app
COPY ./ /usr/local/app/

RUN /usr/local/app/scripts/build_plotly_bundle.sh

# Generate the build of the application
RUN npm run build


# Stage 2: Serve app with nginx server

# Use official nginx image as the base image
FROM nginx:latest

# Copy the build output to replace the default nginx contents.
COPY --from=build /usr/local/app/dist/that-money-was-just-resting-in-my-account /usr/share/nginx/html

# Expose port 80
EXPOSE 80