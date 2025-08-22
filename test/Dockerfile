# --- Stage 1: Build the application ---
FROM gradle:8.4-jdk17-alpine AS build

WORKDIR /app

# --- THIS IS THE LINE TO CHANGE ---
# Changed 'build.gradle' to 'build.gradle.kts'
COPY build.gradle.kts settings.gradle.kts ./ 
# --- END CHANGE ---

COPY gradle ./gradle
COPY src ./src

RUN gradle bootJar -x test

# --- Stage 2: Run the application (leaner runtime image) ---
FROM openjdk:17-jdk-slim-buster

WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]