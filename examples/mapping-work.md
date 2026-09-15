---
workspace: growth-chef
platform: slack
scope: team.growth
agent: relay-prime
collect_seconds: 45
---

# growth-chef / team.growth — broadcasts as projects

Fictional IDs. The `work` table is what Notion dumps. The `channels` table is the wall.

| id | name | role | direction |
|----|------|------|-----------|
| C0MGMT01 | #mgmt | management | in |
| C0REPT02 | #reports | reports | out |
| C0OPS03 | #ops | room | both |
| C0LAUNCH | #launch | room | both |

| id | name | room | state | anchor | owner |
|----|------|------|-------|--------|-------|
| north-star | North Star launch | C0OPS03 | active | | U08AAAA |
| beta-waitlist | Beta waitlist | C0LAUNCH | active | 1000000000.000001 | U06BBBB |
| no-room | Unmapped work | C0GHOST | active | | U06CCCC |
