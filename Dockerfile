FROM ubuntu:latest

RUN apt-get update && apt-get install -y coturn curl

COPY turnserver.conf /etc/turnserver.conf

EXPOSE 3478 3478/udp 5349 5349/udp

CMD ["turnserver", "-v", "-c", "/etc/turnserver.conf"]