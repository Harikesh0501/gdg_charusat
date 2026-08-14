"""add roadmap item fields

Revision ID: 0009_roadmap_fields
Revises: 0008_interview_source
Create Date: 2026-08-14 12:08:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0009_roadmap_fields'
down_revision: Union[str, None] = '0008_interview_source'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    if conn.dialect.has_table(conn, 'roadmap_items'):
        columns = [c['name'] for c in sa.inspect(conn).get_columns('roadmap_items')]
        if 'ref_url' not in columns:
            op.add_column('roadmap_items', sa.Column('ref_url', sa.String(length=500), nullable=True))
        if 'ref_provider' not in columns:
            op.add_column('roadmap_items', sa.Column('ref_provider', sa.String(length=100), nullable=True))
        if 'chapter_title' not in columns:
            op.add_column('roadmap_items', sa.Column('chapter_title', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('roadmap_items', 'chapter_title')
    op.drop_column('roadmap_items', 'ref_provider')
    op.drop_column('roadmap_items', 'ref_url')
