# Compila con el JDK y ejecuta solo con el JRE. Los tests no se pasan aquí: necesitan Docker
# (Testcontainers) y ya los pasa el CI.
FROM eclipse-temurin:25-jdk-alpine AS compilacion
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
# Las dependencias en su propia capa: solo se descargan de nuevo si cambia el pom.xml.
RUN ./mvnw -q -B dependency:go-offline
COPY src src
RUN ./mvnw -q -B package -DskipTests

FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
RUN addgroup -S regicide && adduser -S regicide -G regicide
COPY --from=compilacion /app/target/regicide-backend-*.jar regicide.jar
USER regicide
EXPOSE 8080
# La clasificación consulta la base de datos: si responde, el backend y PostgreSQL funcionan.
HEALTHCHECK --interval=10s --timeout=3s --start-period=40s --retries=5 \
  CMD wget -qO /dev/null http://localhost:8080/api/leaderboard || exit 1
ENTRYPOINT ["java", "-jar", "regicide.jar"]
