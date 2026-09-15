from mapping import MappingError, load_mapping

V02 = """---
workspace: growth-chef
platform: slack
scope: team.growth
agent: relay-prime
---

| id | name | role | direction |
|----|------|------|-----------|
| C0MGMT01 | #mgmt | management | in |
| C0REPT02 | #reports | reports | out |
| C0OPS03 | #ops | room | both |
"""

WORK = """---
workspace: growth-chef
platform: slack
scope: team.growth
agent: relay-prime
---

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
"""


def test_missing_management_is_an_error():
    text = """---
workspace: x
platform: slack
scope: team.x
agent: r
---
| id | name | role | direction |
|----|------|------|-----------|
| C1 | #r | reports | out |
"""
    try:
        load_mapping(text)
        raise AssertionError("accepted a map with no management channel")
    except MappingError:
        pass


def test_v02_map_has_no_work():
    m = load_mapping(V02)
    assert m.work == ()
    assert m.plan() == ()


def test_work_plan_post_gather_gap():
    m = load_mapping(WORK)
    actions = {w.id: a for w, a in m.plan()}
    assert actions["north-star"] == "post"
    assert actions["beta-waitlist"] == "gather"
    assert actions["no-room"] == "gap"


def test_duplicate_work_id_is_an_error():
    text = WORK.replace("| no-room |", "| north-star |", 1)
    try:
        load_mapping(text)
        raise AssertionError("accepted duplicate work id")
    except MappingError as err:
        assert "duplicate work id" in str(err)


if __name__ == "__main__":
    test_missing_management_is_an_error()
    test_v02_map_has_no_work()
    test_work_plan_post_gather_gap()
    test_duplicate_work_id_is_an_error()
    print("ok")
