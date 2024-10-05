#To deploy on gcloud with docker .
#docker build -t us.gcr.io/infrequent-scheduler/infrequent-scheduler:gcloud .
#docker push us.gcr.io/infrequent-scheduler/infrequent-scheduler:gcloud

#for mac
#docker buildx build --platform linux/amd64 -t us-central1-docker.pkg.dev/infrequent-scheduler/infrequent-scheduler/gcloud .
#docker buildx build --platform linux/amd64 -f Dockerfile.service -t us-central1-docker.pkg.dev/infrequent-scheduler/infrequent-scheduler/gcloudjob .

#docker push us-central1-docker.pkg.dev/infrequent-scheduler/infrequent-scheduler/gcloudjob
#docker push us-central1-docker.pkg.dev/infrequent-scheduler/infrequent-scheduler/gcloud .

npx ts-node --transpile-only ./src/app.ts
