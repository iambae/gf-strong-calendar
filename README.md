# GF STRONG CALENDAR SYSTEM :)

## Deployment
1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/)
2. To deploy a new version, run the command `gcloud app deploy --no-promote` from the root project folder
3. To see the newly deployed version, run `gcloud app browse -v <VERSION_ID>`.
To get the VERSION_ID, you can run `gcloud app versions list`
4. After verifying the new version works, direct all the traffic to that version from
the [GCP dashboard](https://console.cloud.google.com/appengine/versions).
Make sure you direct 100% traffic to the new version, and 0% traffic to the old version

##### NOTES:
- While all the deployed versions are independent from one another, they share the same database instance.
So a change to the database structure on one version can potentially break the other versions.
- There's a maximum of 5 app instances on GCP, so if you get a deployment error you might need to go to GCP dashboard
and delete one of the older unused versions.
