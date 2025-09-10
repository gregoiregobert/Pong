FROM node:latest

RUN apt update -y && apt upgrade -y

COPY Backend/entrypoint.sh .

EXPOSE 3333

ENTRYPOINT [ "/bin/sh", "entrypoint.sh" ]