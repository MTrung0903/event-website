FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app

COPY . .
RUN mvn clean package -DskipTests

# Run stage
FROM openjdk:21-jdk-slim
WORKDIR /app

COPY --from=build /app/target/event-management-0.0.1-SNAPSHOT.jar event-managermen-server.jar
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "event-managermen-server.jar"]
