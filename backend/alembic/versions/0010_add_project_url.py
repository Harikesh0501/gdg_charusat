"""Add url column to projects table

Revision ID: 0010_add_project_url
Revises: 0009_add_roadmap_item_fields
Create Date: 2026-08-14 08:03:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '0010_add_project_url'
down_revision = '0009_roadmap_fields'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('projects', sa.Column('url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column('projects', 'url')
