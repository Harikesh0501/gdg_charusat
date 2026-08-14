"""progress tables

Revision ID: 0007_progress
Revises: 0006_interview
Create Date: 2026-08-14 02:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0007_progress'
down_revision: Union[str, None] = '0006_interview'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # Create ENUM type for Postgres if using Postgres
    if conn.dialect.name == 'postgresql':
        conn.execute(sa.text("""
            DO $$ BEGIN
                CREATE TYPE progress_event_type_enum AS ENUM ('item_completed', 'resume_uploaded', 'skill_added', 'interview_completed', 'goal_set');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        """))

        event_type = postgresql.ENUM('item_completed', 'resume_uploaded', 'skill_added', 'interview_completed', 'goal_set', name='progress_event_type_enum', create_type=False)
        uuid_type = postgresql.UUID(as_uuid=True)
    else:
        event_type = sa.Enum('item_completed', 'resume_uploaded', 'skill_added', 'interview_completed', 'goal_set', name='progress_event_type_enum')
        uuid_type = sa.String(length=36)

    # Create learning_progress table
    if not conn.dialect.has_table(conn, 'learning_progress'):
        op.create_table(
            'learning_progress',
            sa.Column('id', uuid_type, nullable=False),
            sa.Column('profile_id', uuid_type, nullable=False),
            sa.Column('event_type', event_type, nullable=False, server_default='item_completed'),
            sa.Column('title', sa.String(length=255), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('metadata_json', sa.JSON(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
            sa.ForeignKeyConstraint(['profile_id'], ['profiles.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_learning_progress_profile_id', 'learning_progress', ['profile_id'])


def downgrade() -> None:
    op.drop_index('ix_learning_progress_profile_id', table_name='learning_progress')
    op.drop_table('learning_progress')

    conn = op.get_bind()
    if conn.dialect.name == 'postgresql':
        conn.execute(sa.text("DROP TYPE IF EXISTS progress_event_type_enum;"))
