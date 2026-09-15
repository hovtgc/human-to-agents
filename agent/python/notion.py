"""Notion holds the projects. It is not the wall.

Dump the Projects database to a markdown `work` table (id, name, room,
state, anchor, owner) and pass that file as --mapping together with the
channels table. This module does not open a network connection.
"""


def materialize() -> str:
    raise RuntimeError(
        "notion provider is a skeleton: dump Projects to markdown, then --mapping that file"
    )
