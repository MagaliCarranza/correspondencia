# =============================================================================
# Stage 1: build del jar con Maven wrapper
# =============================================================================
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copiar primero solo pom.xml + wrapper para aprovechar la cache de Docker:
# si cambia el codigo pero no las dependencias, no se re-descargan.
COPY mvnw ./
COPY .mvn ./.mvn
COPY pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline

# Ahora si copiamos el codigo y empaquetamos.
COPY src ./src
RUN ./mvnw -B -q clean package -DskipTests

# =============================================================================
# Stage 2: imagen final con solo el jar y JRE
# =============================================================================
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Usuario no-root para reducir superficie de ataque.
RUN groupadd --system spring && useradd --system --gid spring --home /app spring
RUN chown -R spring:spring /app
USER spring

COPY --from=build --chown=spring:spring /app/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
