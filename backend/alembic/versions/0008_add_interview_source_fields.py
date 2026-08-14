"""add interview source fields

Revision ID: 0008_interview_source
Revises: 0007_progress
Create Date: 2026-08-14 11:42:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0008_interview_source'
down_revision: Union[str, None] = '0007_progress'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    if conn.dialect.has_table(conn, 'interview_questions'):
        columns = [c['name'] for c in sa.inspect(conn).get_columns('interview_questions')]
        if 'source_reference' not in columns:
            op.add_column('interview_questions', sa.Column('source_reference', sa.String(length=255), nullable=True))
        if 'reference_url' not in columns:
            op.add_column('interview_questions', sa.Column('reference_url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column('interview_questions', 'reference_url')
    op.drop_column('interview_questions', 'source_reference')
