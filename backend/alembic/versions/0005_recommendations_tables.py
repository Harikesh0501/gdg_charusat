"""recommendations tables

Revision ID: 0005_recommendations
Revises: 0004_roadmap
Create Date: 2026-08-14 01:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0005_recommendations'
down_revision: Union[str, None] = '0004_roadmap'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # Create ENUM types for Postgres if using Postgres
    if conn.dialect.name == 'postgresql':
        conn.execute(sa.text("""
            DO $$ BEGIN
                CREATE TYPE resource_type_enum AS ENUM ('course', 'article', 'video', 'doc');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        """))
        conn.execute(sa.text("""
            DO $$ BEGIN
                CREATE TYPE cert_level_enum AS ENUM ('entry', 'associate', 'professional');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        """))

        resource_type = postgresql.ENUM('course', 'article', 'video', 'doc', name='resource_type_enum', create_type=False)
        cert_level_type = postgresql.ENUM('entry', 'associate', 'professional', name='cert_level_enum', create_type=False)
        uuid_type = postgresql.UUID(as_uuid=True)
    else:
        resource_type = sa.Enum('course', 'article', 'video', 'doc', name='resource_type_enum')
        cert_level_type = sa.Enum('entry', 'associate', 'professional', name='cert_level_enum')
        uuid_type = sa.String(length=36)

    # Create resources table
    if not conn.dialect.has_table(conn, 'resources'):
        op.create_table(
            'resources',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('title', sa.String(length=255), nullable=False),
            sa.Column('url', sa.String(length=500), nullable=False),
            sa.Column('provider', sa.String(length=100), nullable=False),
            sa.Column('type', resource_type, nullable=False, server_default='course'),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('difficulty', sa.Integer(), nullable=False, server_default='1'),
            sa.Column('estimated_hours', sa.Integer(), nullable=False, server_default='10'),
            sa.PrimaryKeyConstraint('id')
        )

    # Create projects table
    if not conn.dialect.has_table(conn, 'projects'):
        op.create_table(
            'projects',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('title', sa.String(length=255), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('difficulty', sa.Integer(), nullable=False, server_default='2'),
            sa.Column('estimated_hours', sa.Integer(), nullable=False, server_default='15'),
            sa.Column('career_relevance', sa.String(length=255), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )

    # Create certifications table
    if not conn.dialect.has_table(conn, 'certifications'):
        op.create_table(
            'certifications',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('title', sa.String(length=255), nullable=False),
            sa.Column('provider', sa.String(length=100), nullable=False),
            sa.Column('url', sa.String(length=500), nullable=False),
            sa.Column('level', cert_level_type, nullable=False, server_default='entry'),
            sa.PrimaryKeyConstraint('id')
        )

    # Create resource_skills table
    if not conn.dialect.has_table(conn, 'resource_skills'):
        op.create_table(
            'resource_skills',
            sa.Column('resource_id', sa.Integer(), sa.ForeignKey('resources.id', ondelete='CASCADE'), primary_key=True),
            sa.Column('skill_id', sa.Integer(), sa.ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True),
        )

    # Create project_skills table
    if not conn.dialect.has_table(conn, 'project_skills'):
        op.create_table(
            'project_skills',
            sa.Column('project_id', sa.Integer(), sa.ForeignKey('projects.id', ondelete='CASCADE'), primary_key=True),
            sa.Column('skill_id', sa.Integer(), sa.ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True),
        )

    # Create certification_skills table
    if not conn.dialect.has_table(conn, 'certification_skills'):
        op.create_table(
            'certification_skills',
            sa.Column('certification_id', sa.Integer(), sa.ForeignKey('certifications.id', ondelete='CASCADE'), primary_key=True),
            sa.Column('skill_id', sa.Integer(), sa.ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True),
        )

    # Create recommendation_logs table
    if not conn.dialect.has_table(conn, 'recommendation_logs'):
        op.create_table(
            'recommendation_logs',
            sa.Column('id', uuid_type, nullable=False),
            sa.Column('profile_id', uuid_type, nullable=False),
            sa.Column('category', sa.String(length=50), nullable=False),
            sa.Column('career_role_id', sa.Integer(), nullable=False),
            sa.Column('recommended_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
            sa.ForeignKeyConstraint(['career_role_id'], ['career_roles.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['profile_id'], ['profiles.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_recommendation_logs_profile_id', 'recommendation_logs', ['profile_id'])


def downgrade() -> None:
    op.drop_index('ix_recommendation_logs_profile_id', table_name='recommendation_logs')
    op.drop_table('recommendation_logs')
    op.drop_table('certification_skills')
    op.drop_table('project_skills')
    op.drop_table('resource_skills')
    op.drop_table('certifications')
    op.drop_table('projects')
    op.drop_table('resources')

    conn = op.get_bind()
    if conn.dialect.name == 'postgresql':
        conn.execute(sa.text("DROP TYPE IF EXISTS cert_level_enum;"))
        conn.execute(sa.text("DROP TYPE IF EXISTS resource_type_enum;"))
