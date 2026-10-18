# Broadcasts

The message in the room is a card, not a form. Four kinds. Empty fields are omitted. There is no `broadcast:` line.

| kind | state | when |
|------|-------|------|
| `kickoff` | active | first post. This opens the thread. |
| `nudge` | active | same thread, still waiting |
| `blocked` | blocked | the row is blocked |
| `done` | closed | the row is closed. Do not ask for a reply. |

A kind that does not match its state is an error. So is a missing title.

## Fields

| field | renders |
|-------|---------|
| title | one bold line |
| work id + state | `` `id`  ·  active `` |
| owner | `{name} owns it` — omit if empty |
| assignee | `{name} is on it` — omit if empty |
| quote | one blockquote, optional attribution |

Pass a resolved name or a real mention. Do not guess one. An unresolved id stays an id.

Slack bolds with `*title*`. Discord bolds with `**title**`.

Rendered examples: [examples/broadcasts.md](/blob/examples/broadcasts.md).
