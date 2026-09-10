from mapping import MappingError, load_mapping


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


if __name__ == "__main__":
    test_missing_management_is_an_error()
    print("ok")
