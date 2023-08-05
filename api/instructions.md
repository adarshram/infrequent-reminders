#psql -h localhost -d infrequent_scheduler -U adarshram -W
#To deploy on gcloud with docker .
#docker build -t us.gcr.io/infrequent-scheduler/infrequent-scheduler:gcloud .
#docker push us.gcr.io/infrequent-scheduler/infrequent-scheduler:gcloud

#docker build -f Dockerfile.service -t us.gcr.io/infrequent-scheduler/infrequent-scheduler:gcloudjob .
#docker push us.gcr.io/infrequent-scheduler/infrequent-scheduler:gcloudjob
psql -h localhost -d infrequent_scheduler -U adarshram -W

npx ts-node --transpile-only ./src/app.ts
