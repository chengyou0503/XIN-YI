#!/bin/bash
set -e

PROJECT_ID="xiyi-c4266"
SA_NAME="github-action-deploy"
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

echo "Granting permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/firebase.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/cloudfunctions.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/artifactregistry.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/iam.serviceAccountUser"

echo "Generating Key..."
rm -f sa-key.json
gcloud iam service-accounts keys create sa-key.json --iam-account=$SA_EMAIL

echo "Setting GitHub Secret..."
gh secret set FIREBASE_SERVICE_ACCOUNT_XIYI_C4266 < sa-key.json

echo "Cleanup..."
rm sa-key.json

echo "Done!"
