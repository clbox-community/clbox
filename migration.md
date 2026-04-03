# Migration: Firebase Functions Config → Environment Variables

This guide describes how to migrate an existing deployment from the old
`firebase functions:config` approach to the new environment variable approach
introduced when the backend was migrated to read configuration from `process.env`.

## Background

Previously, runtime secrets were stored using Firebase's legacy runtime config:

```
firebase functions:config:set slack.signingsecret="..."
firebase functions:config:set slack.bottoken="..."
firebase functions:config:set webapp.url="..."
```

These values were read in code via `functions.config().slack.signingsecret`, etc.

The new approach reads values from standard OS environment variables
(`process.env.SLACK_SIGNINGSECRET`, etc.), which is the recommended pattern
compatible with [Cloud Secret Manager](https://firebase.google.com/docs/functions/config-env#secret-manager).

---

## Migration steps for an existing environment

### 1. Read the current values from Firebase config

```bash
firebase functions:config:get
```

Note down the values for:

| Old key                  | New env variable name  |
|--------------------------|------------------------|
| `slack.signingsecret`    | `SLACK_SIGNINGSECRET`  |
| `slack.bottoken`         | `SLACK_BOTTOKEN`       |
| `webapp.url`             | `WEBAPP_URL`           |
| `skills.exportkey`       | `SKILLS_EXPORTKEY`     |

### 2. Store the values as Cloud Secrets (recommended)

Cloud Secret Manager encrypts secrets at rest and grants fine-grained access.

```bash
firebase functions:secrets:set SLACK_SIGNINGSECRET
# Paste the value of slack.signingsecret when prompted

firebase functions:secrets:set SLACK_BOTTOKEN
# Paste the value of slack.bottoken when prompted

firebase functions:secrets:set WEBAPP_URL
# Paste the value of webapp.url when prompted

firebase functions:secrets:set SKILLS_EXPORTKEY
# Paste the value of skills.exportkey when prompted
```

Verify the secrets were created:

```bash
firebase functions:secrets:get SLACK_SIGNINGSECRET
firebase functions:secrets:get SLACK_BOTTOKEN
firebase functions:secrets:get WEBAPP_URL
firebase functions:secrets:get SKILLS_EXPORTKEY
```

> **Note for Firebase Functions v1:** secrets from Cloud Secret Manager are only
> injected into `process.env` at function invocation when each secret is declared
> on the function via `runWith({ secrets: [...] })`. The current code already
> declares all four secrets in the shared `functionBuilder`, so they will be
> available automatically after deploy.

### 3. Deploy the updated functions

```bash
firebase deploy --only functions
```

Cloud Functions will automatically pick up the secrets from Secret Manager
because they match the environment variable names used in `process.env`.

### 4. Verify the deployment

Check the Firebase console (Functions → Logs) or run a test Slack command to
confirm the functions are operating correctly with the new configuration.

### 5. (Optional) Clean up the old Firebase config

Once you have verified everything works you may remove the now-unused legacy
config entries to avoid confusion:

```bash
firebase functions:config:unset slack
firebase functions:config:unset webapp
```

> **Note:** Removing the old config has no effect on the running functions
> because they no longer read from `functions.config()`.

---

## Local development

For local development, create a file `apps/backend/.env.local` (gitignored)
with the plain-text values:

```
SLACK_BOTTOKEN=xoxb-your-bot-token
SLACK_SIGNINGSECRET=your-signing-secret
WEBAPP_URL=https://your-webapp-url
SKILLS_EXPORTKEY=your-export-public-key
```

Pass it to the emulator or serve command, for example:

```bash
dotenvx run --env-file=apps/backend/.env.local -- nx serve backend
```

You no longer need to download `.runtimeconfig.json` from Firebase — the
`firebase functions:config:get > .runtimeconfig.json` step described in older
documentation is obsolete for the current codebase.
