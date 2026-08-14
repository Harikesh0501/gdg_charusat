"""career roles and goals

Revision ID: 0003_career
Revises: 0002_skills
Create Date: 2026-08-13 22:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0003_career'
down_revision: Union[str, None] = '0002_skills'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # Create skill_importance_enum via DO block on Postgres
    if conn.dialect.name == 'postgresql':
        conn.execute(sa.text("""
            DO $$ BEGIN
                CREATE TYPE skill_importance_enum AS ENUM ('core', 'important', 'nice_to_have');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        """))

    # Create career_roles table
    if not conn.dialect.has_table(conn, 'career_roles'):
        op.create_table(
            'career_roles',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('slug', sa.String(), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('name'),
            sa.UniqueConstraint('slug')
        )
        op.create_index('ix_career_roles_slug', 'career_roles', ['slug'])

    # Create career_role_skills table
    if not conn.dialect.has_table(conn, 'career_role_skills'):
        op.create_table(
            'career_role_skills',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('career_role_id', sa.Integer(), nullable=False),
            sa.Column('skill_id', sa.Integer(), nullable=False),
            sa.Column('required_proficiency', sa.Integer(), nullable=False, server_default='3'),
            sa.Column('importance', sa.Enum('core', 'important', 'nice_to_have', name='skill_importance_enum'), nullable=False),
            sa.ForeignKeyConstraint(['career_role_id'], ['career_roles.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('career_role_id', 'skill_id', name='uq_career_role_skills_role_skill')
        )
        op.create_index('ix_career_role_skills_career_role_id', 'career_role_skills', ['career_role_id'])
        op.create_index('ix_career_role_skills_skill_id', 'career_role_skills', ['skill_id'])

    # Create career_goals table
    if not conn.dialect.has_table(conn, 'career_goals'):
        op.create_table(
            'career_goals',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('profile_id', sa.String(length=36), nullable=False),
            sa.Column('career_role_id', sa.Integer(), nullable=False),
            sa.Column('target_timeline_months', sa.Integer(), nullable=False, server_default='6'),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
            sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
            sa.ForeignKeyConstraint(['career_role_id'], ['career_roles.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['profile_id'], ['profiles.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('profile_id')
        )
        op.create_index('ix_career_goals_profile_id', 'career_goals', ['profile_id'])
        op.create_index('ix_career_goals_career_role_id', 'career_goals', ['career_role_id'])


def downgrade() -> None:
    op.drop_index('ix_career_goals_career_role_id', table_name='career_goals')
    op.drop_index('ix_career_goals_profile_id', table_name='career_goals')
    op.drop_table('career_goals')

    op.drop_index('ix_career_role_skills_skill_id', table_name='career_role_skills')
    op.drop_index('ix_career_role_skills_career_role_id', table_name='career_role_skills')
    op.drop_table('career_role_skills')

    op.drop_index('ix_career_roles_slug', table_name='career_roles')
    op.drop_table('career_roles')

    conn = op.get_bind()
    if conn.dialect.name == 'postgresql':
        conn.execute(sa.text("DROP TYPE IF EXISTS skill_importance_enum;"))
