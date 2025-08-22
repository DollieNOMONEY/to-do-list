# --- Stage 1: Build the application ---
# --- FIX THIS LINE ---
FROM gradle:8.4-jdk21-alpine AS build
# --- END FIX ---

# Set working directory inside the container.
WORKDIR /app

# Copy only the Gradle build files first.
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle ./gradle

# Copy the source code last.
COPY src ./src

# Build the application into a 'fat JAR'.
RUN gradle bootJar -x test

# --- Stage 2: Run the application (leaner runtime image) ---
# It's also a good idea to ensure your runtime image uses JDK 21 if your application strictly requires it
FROM openjdk:21-jdk-slim-buster
# --- END FIX ---

# Set the working directory for the runtime stage.
WORKDIR /app

# Copy the built JAR file from the build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose the port that your Spring Boot application listens on (default is 8080).
EXPOSE 8080

# Define the command to run your application.
ENTRYPOINT ["java", "-jar", "app.jar"]