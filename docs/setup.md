# Setup

## Local

Python 3.11+ or Node 22. No packages required for `--dry-run`.

```bash
python agent/python/relay.py --mapping examples/mapping.md --dry-run
```

Dry-run prints the parsed mapping, the scope wall, and a sample report. It does not open a socket.

## Source

`--mapping` is a path or an `https://` URL:

```bash
python agent/python/relay.py --mapping https://example.com/team.growth.md --dry-run
```

## Cloud

Run the same command without `--dry-run` as a long-lived process. Reload the map with `SIGHUP`. Do not restart to add a channel.

## Tokens

| Variable | Used by |
|----------|---------|
| `SLACK_BOT_TOKEN` | Slack adapter |
| `DISCORD_BOT_TOKEN` | Discord adapter |

Tokens never live in the mapping file.
