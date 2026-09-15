import json

from mapping import load_mapping
from notion import NotionClient, NotionError, apply_writes, clip, load_work_from_notion, work_from_page

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

PAGE = {
    "id": "page-north",
    "properties": {
        "Name": {"type": "title", "title": [{"plain_text": "North Star launch"}]},
        "Scope key": {"type": "rich_text", "rich_text": [{"plain_text": "north-star"}]},
        "Admin Channel": {"type": "rich_text", "rich_text": [{"plain_text": "C0OPS03"}]},
        "Status": {"type": "status", "status": {"name": "In Progress"}},
        "Broadcast TS": {"type": "rich_text", "rich_text": []},
        "Owner": {"type": "rich_text", "rich_text": [{"plain_text": "U08AAAA"}]},
    },
}


def test_work_from_page():
    w = work_from_page(PAGE)
    assert w is not None
    assert w.id == "north-star"
    assert w.room == "C0OPS03"
    assert w.state == "active"
    assert w.anchor == ""
    assert w.page_id == "page-north"


def test_query_overlays_mapping():
    calls = []

    def transport(method, url, headers, body):
        calls.append((method, url))
        return {"results": [PAGE], "has_more": False}

    client = NotionClient("secret_test", transport)
    mapping = load_work_from_notion(load_mapping(SAMPLE), "db1", client)
    assert len(mapping.work) == 1
    assert mapping.plan()[0][1] == "post"
    assert calls[0][0] == "POST"
    assert "/databases/db1/query" in calls[0][1]


def test_dry_run_does_not_patch():
    calls = []

    def transport(method, url, headers, body):
        calls.append(method)
        return {"results": [PAGE], "has_more": False}

    client = NotionClient("secret_test", transport)
    mapping = load_work_from_notion(load_mapping(SAMPLE), "db1", client)
    calls.clear()
    lines = apply_writes(client, mapping.plan(), {}, {}, dry_run=True)
    assert any("POST" in line for line in lines)
    assert calls == []


def test_live_write_patches_anchor():
    calls = []

    def transport(method, url, headers, body):
        calls.append((method, url, json.loads(body.decode()) if body else None))
        return {}

    client = NotionClient("secret_test", transport)
    w = work_from_page(PAGE)
    apply_writes(
        client,
        ((w, "post"),),
        {"north-star": ("1000000000.000002", "https://example.slack.com/archives/C0OPS03/p1000000000002")},
        {},
        dry_run=False,
    )
    assert calls[0][0] == "PATCH"
    assert "/pages/page-north" in calls[0][1]
    ts = calls[0][2]["properties"]["Broadcast TS"]["rich_text"][0]["text"]["content"]
    assert ts == "1000000000.000002"
    link = calls[0][2]["properties"]["Broadcast Permalink"]["rich_text"][0]["text"]["content"]
    assert link.startswith("https://example.slack.com/")


def test_post_without_ts_does_not_patch():
    calls = []

    def transport(method, url, headers, body):
        calls.append(method)
        return {}

    client = NotionClient("secret_test", transport)
    w = work_from_page(PAGE)
    lines = apply_writes(client, ((w, "post"),), {}, {}, dry_run=False)
    assert calls == []
    assert any("no ts" in line for line in lines)


def test_empty_ts_is_refused():
    client = NotionClient("secret_test", lambda *a: {})
    w = work_from_page(PAGE)
    try:
        client.write_anchor(w.page_id, "", "https://example.slack.com/p1")
        raise AssertionError("wrote empty Broadcast TS")
    except NotionError:
        pass


def test_clip_marks_truncation():
    out = clip("x" * 3000)
    assert len(out) == 2000
    assert out.endswith("(truncated)")


if __name__ == "__main__":
    test_work_from_page()
    test_query_overlays_mapping()
    test_dry_run_does_not_patch()
    test_live_write_patches_anchor()
    test_post_without_ts_does_not_patch()
    test_empty_ts_is_refused()
    test_clip_marks_truncation()
    print("ok")
