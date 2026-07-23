# Stage 1: build del jar con Maven wrapper
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

COPY mvnw ./
COPY .mvn ./.mvn
COPY pom.xml ./

RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline

COPY src ./src
RUN ./mvnw -B -q clean package -DskipTests

# Stage 2: imagen final ligera con solo el jar
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
