from broadcast import Broadcast, BroadcastError, kickoff_for, render
from mapping import Work

FULL = """*North Star launch*
`north-star`  ·  active

Jordan Lee owns it
Ada Chen is on it

> Default to the single, then the pair, then the set.
> — Jordan Lee

Reply in this thread. One status is enough.
"""


def test_kickoff_is_a_card_not_a_dump():
    text = render(
        Broadcast(
            kind="kickoff",
            work_id="north-star",
            title="North Star launch",
            state="active",
            owner="Jordan Lee",
            assignee="Ada Chen",
            quote="Default to the single, then the pair, then the set.",
            quote_from="Jordan Lee",
        )
    )
    assert text == FULL
    for banned in ("broadcast:", "state:", "owner:", "in flight:", "context:"):
        assert banned not in text


def test_empty_fields_are_omitted():
    text = render(
        Broadcast(
            kind="nudge",
            work_id="beta-waitlist",
            title="Beta waitlist",
            state="active",
        )
    )
    assert "owns it" not in text
    assert "is on it" not in text
    assert ">" not in text
    assert text.endswith("Still open. Reply in this thread.\n")


def test_discord_bolds_with_two_stars():
    text = render(
        Broadcast(
            kind="done",
            work_id="north-star",
            title="North Star launch",
            state="closed",
            platform="discord",
        )
    )
    assert text.startswith("**North Star launch**\n")
    assert text.endswith("Closed.\n")


def test_kind_must_match_state():
    try:
        render(
            Broadcast(
                kind="kickoff",
                work_id="north-star",
                title="North Star launch",
                state="blocked",
            )
        )
        raise AssertionError("kickoff accepted a blocked row")
    except BroadcastError:
        pass


def test_kickoff_for_uses_the_work_row():
    w = Work(
        id="north-star",
        name="North Star launch",
        room="C0OPS03",
        state="active",
        anchor="",
        owner="Jordan Lee",
    )
    text = kickoff_for(w, assignee="Ada Chen")
    assert "Jordan Lee owns it" in text
    assert "Ada Chen is on it" in text
    assert text.startswith("*North Star launch*\n")


if __name__ == "__main__":
    test_kickoff_is_a_card_not_a_dump()
    test_empty_fields_are_omitted()
    test_discord_bolds_with_two_stars()
    test_kind_must_match_state()
    test_kickoff_for_uses_the_work_row()
    print("ok")
