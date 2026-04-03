### Starting with custom env (web app)

`.dev.local.env` holds the `NX_PUBLIC_*` Firebase config for the **web app**.
Copy `.env.template` to `.dev.local.env`, fill in your project values, then run:

```
dotenvx run --env-file=.dev.local.env -- nx serve web-app
```

### Setting up environment variables for Cloud Functions

Cloud Functions reads configuration from OS environment variables.
The recommended approach is [Cloud Secret Manager](https://firebase.google.com/docs/functions/config-env#secret-manager):

```
$ firebase functions:secrets:set SLACK_SIGNINGSECRET
# enter value when prompted
$ firebase functions:secrets:set SLACK_BOTTOKEN
# enter value when prompted
$ firebase functions:secrets:set WEBAPP_URL
# enter value when prompted
$ firebase functions:secrets:set SKILLS_EXPORTKEY
# enter value when prompted
```

> If you previously used `firebase functions:config:set`, see [migration.md](migration.md)
> for instructions on migrating existing values to the new approach.

### Local development (backend)

For local development of the backend, create an `apps/backend/.env.local` file (gitignored) with:

```
SLACK_BOTTOKEN=your-bot-token
SLACK_SIGNINGSECRET=your-signing-secret
WEBAPP_URL=https://your-webapp-url
SKILLS_EXPORTKEY=your-export-public-key
```

Then serve the backend with that file loaded:

```
dotenvx run --env-file=apps/backend/.env.local -- nx serve backend
```
