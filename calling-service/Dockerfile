
# Build the Spring Boot application using Java 17
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -B clean package -DskipTests

# Run the packaged application
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/calling-service-1.0.0-SNAPSHOT.jar app.jar

EXPOSE 8089

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8089} -jar app.jar"]
