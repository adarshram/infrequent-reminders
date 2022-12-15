# syntax=docker/dockerfile:1
FROM node:16-alpine
WORKDIR /app
RUN npm install -g nodemon
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
CMD ["npx","ts-node","--transpile-only","./src/app.ts"]
#RUN crontab -l > crontab_new 
#RUN echo "0       8       *       *       *       cd /app && npx ts-node --transpile-only /app/src/scripts/runDailyCron.ts" >> crontab_new
#RUN crontab crontab_new
#RUN rm crontab_new
#RUN chmod 755 entrypoint.sh
#CMD ["./entrypoint.sh"]
#RUN npx ts-node --transpile-only ./src/scripts/runDailyCron.ts
#npx ts-node --transpile-only ./src/app.ts






