### Starting with custom env

```
dotenvx run --env-file=.dev.local.env -- nx serve
```

### Testing Functions with local copy of Cloud Config

```
firebase functions:config:get > .runtimeconfig.json
```

### Setting up slack signing secret and bot token

```
$ firebase functions:config:set slack.signingsecret="SIGNING_SECRET"
$ firebase functions:config:set slack.bottoken="BOT_OAUTH_TOKEN"
```

### Setting up webapp url for slack notifications

```
$ firebase functions:config:set webapp.url="WEBAPP_URL"
```

### Setting up key for skill tree export

```
$ firebase functions:config:set skills.exportkey="export-key"
```
