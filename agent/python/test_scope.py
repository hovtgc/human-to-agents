from mapping import load_mapping
from scope import ScopeError, ScopeGuard

SAMPLE = """---
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


def test_unknown_channel_is_invisible():
    mapping = load_mapping(SAMPLE)
    guard = ScopeGuard(mapping)
    assert guard.allow("C0OPS03")
    assert not guard.allow("C0SECRET")
    try:
        guard.require("C0SECRET", "write")
        raise AssertionError("wall failed")
    except ScopeError as err:
        assert "C0SECRET" not in str(err)


def test_redact_does_not_echo_unknown_id():
    guard = ScopeGuard(load_mapping(SAMPLE))
    assert guard.redact("C0OPS03") == "C0OPS03"
    assert guard.redact("C0SECRET") == "<outside-scope>"


if __name__ == "__main__":
    test_unknown_channel_is_invisible()
    test_redact_does_not_echo_unknown_id()
    print("ok")
