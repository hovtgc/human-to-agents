from report import Crumb, format_crumb


def test_crumb_without_permalink_is_dropped():
    c = Crumb(author_id="U1", author_name="Ada", claim="shipped", permalink="")
    assert format_crumb(c) is None


def test_unresolved_author_is_not_named():
    c = Crumb(
        author_id="U0NONE01",
        author_name="",
        claim="thank you",
        permalink="https://example.slack.com/archives/C0OPS03/p1",
    )
    line = format_crumb(c)
    assert line is not None
    assert "Ada" not in line
    assert "<unresolved:U0NONE01>" in line
    assert "https://example.slack.com/archives/C0OPS03/p1" in line


if __name__ == "__main__":
    test_crumb_without_permalink_is_dropped()
    test_unresolved_author_is_not_named()
    print("ok")
