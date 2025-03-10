FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY backend-gateway-service/build/libs/*.jar app.jar

ENV JAVA_OPTS=""

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"] 