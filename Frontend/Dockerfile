FROM node:19

RUN apt update -y && apt upgrade -y

RUN npm install -g @angular/cli@16.2.9

COPY Frontend/config.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/config.sh

EXPOSE 4200

ENTRYPOINT ["/bin/bash", "-c", "/usr/local/bin/config.sh"]
