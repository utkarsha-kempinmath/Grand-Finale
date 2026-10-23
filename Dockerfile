
# Build stage
FROM maven:3.9.9-eclipse-temurin-17 AS builder

WORKDIR /build

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=builder /build/target/rural-healthcare-platform-1.0.0-SNAPSHOT.jar app.jar

EXPOSE 8081

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8081} -jar app.jar"]
