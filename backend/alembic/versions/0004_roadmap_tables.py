"""roadmap tables

Revision ID: 0004_roadmap
Revises: 0003_career
Create Date: 2026-08-13 23:55:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0004_roadmap'
down_revision: Union[str, None] = '0003_career'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # Create ENUM types for Postgres if using Postgres
    if conn.dialect.name == 'postgresql':
        conn.execute(sa.text("""
            DO $$ BEGIN
                CREATE TYPE roadmap_status_enum AS ENUM ('active', 'completed', 'archived');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        """))
        conn.execute(sa.text("""
            DO $$ BEGIN
                CREATE TYPE roadmap_item_type_enum AS ENUM ('skill', 'resource', 'project', 'milestone');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        """))
        conn.execute(sa.text("""
            DO $$ BEGIN
                CREATE TYPE roadmap_item_status_enum AS ENUM ('not_started', 'in_progress', 'completed');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        """))

        status_type = postgresql.ENUM('active', 'completed', 'archived', name='roadmap_status_enum', create_type=False)
        item_type = postgresql.ENUM('skill', 'resource', 'project', 'milestone', name='roadmap_item_type_enum', create_type=False)
        item_status_type = postgresql.ENUM('not_started', 'in_progress', 'completed', name='roadmap_item_status_enum', create_type=False)
        uuid_type = postgresql.UUID(as_uuid=True)
    else:
        status_type = sa.Enum('active', 'completed', 'archived', name='roadmap_status_enum')
        item_type = sa.Enum('skill', 'resource', 'project', 'milestone', name='roadmap_item_type_enum')
        item_status_type = sa.Enum('not_started', 'in_progress', 'completed', name='roadmap_item_status_enum')
        uuid_type = sa.String(length=36)

    # Create roadmaps table
    if not conn.dialect.has_table(conn, 'roadmaps'):
        op.create_table(
            'roadmaps',
            sa.Column('id', uuid_type, nullable=False),
            sa.Column('profile_id', uuid_type, nullable=False),
            sa.Column('career_role_id', sa.Integer(), nullable=False),
            sa.Column('status', status_type, nullable=False, server_default='active'),
            sa.Column('overall_strategy', sa.Text(), nullable=True),
            sa.Column('generated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
            sa.Column('model_used', sa.String(length=100), nullable=True),
            sa.ForeignKeyConstraint(['career_role_id'], ['career_roles.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['profile_id'], ['profiles.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_roadmaps_profile_id', 'roadmaps', ['profile_id'])
        op.create_index('ix_roadmaps_career_role_id', 'roadmaps', ['career_role_id'])
        op.create_index('ix_roadmaps_status', 'roadmaps', ['status'])

    # Create roadmap_phases table
    if not conn.dialect.has_table(conn, 'roadmap_phases'):
        op.create_table(
            'roadmap_phases',
            sa.Column('id', uuid_type, nullable=False),
            sa.Column('roadmap_id', uuid_type, nullable=False),
            sa.Column('order_index', sa.Integer(), nullable=False),
            sa.Column('title', sa.String(length=255), nullable=False),
            sa.Column('summary', sa.Text(), nullable=True),
            sa.ForeignKeyConstraint(['roadmap_id'], ['roadmaps.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_roadmap_phases_roadmap_id', 'roadmap_phases', ['roadmap_id'])

    # Create roadmap_items table
    if not conn.dialect.has_table(conn, 'roadmap_items'):
        op.create_table(
            'roadmap_items',
            sa.Column('id', uuid_type, nullable=False),
            sa.Column('phase_id', uuid_type, nullable=False),
            sa.Column('type', item_type, nullable=False),
            sa.Column('ref_skill_id', sa.Integer(), nullable=True),
            sa.Column('ref_resource_id', uuid_type, nullable=True),
            sa.Column('ref_project_id', uuid_type, nullable=True),
            sa.Column('title', sa.String(length=255), nullable=False),
            sa.Column('order_index', sa.Integer(), nullable=False),
            sa.Column('status', item_status_type, nullable=False, server_default='not_started'),
            sa.Column('estimated_hours', sa.Integer(), nullable=False, server_default='10'),
            sa.ForeignKeyConstraint(['phase_id'], ['roadmap_phases.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['ref_skill_id'], ['skills.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_roadmap_items_phase_id', 'roadmap_items', ['phase_id'])


def downgrade() -> None:
    op.drop_index('ix_roadmap_items_phase_id', table_name='roadmap_items')
    op.drop_table('roadmap_items')

    op.drop_index('ix_roadmap_phases_roadmap_id', table_name='roadmap_phases')
    op.drop_table('roadmap_phases')

    op.drop_index('ix_roadmaps_status', table_name='roadmaps')
    op.drop_index('ix_roadmaps_career_role_id', table_name='roadmaps')
    op.drop_index('ix_roadmaps_profile_id', table_name='roadmaps')
    op.drop_table('roadmaps')

    conn = op.get_bind()
    if conn.dialect.name == 'postgresql':
        conn.execute(sa.text("DROP TYPE IF EXISTS roadmap_item_status_enum;"))
        conn.execute(sa.text("DROP TYPE IF EXISTS roadmap_item_type_enum;"))
        conn.execute(sa.text("DROP TYPE IF EXISTS roadmap_status_enum;"))
