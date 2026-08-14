"""initial users and profiles

Revision ID: 0001_init
Revises: 
Create Date: 2026-08-11 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0001_init'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    if conn.dialect.name == 'postgresql':
        conn.execute(sa.text("""
            DO $$ BEGIN
                CREATE TYPE education_level_enum AS ENUM ('high_school', 'undergraduate', 'postgraduate', 'other');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        """))

    # Create users table (skip if already exists)
    if not conn.dialect.has_table(conn, 'users'):
        op.create_table(
            'users',
            sa.Column('id', sa.String(length=36), primary_key=True),
            sa.Column('supabase_user_id', sa.String(), nullable=False),
            sa.Column('email', sa.String(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        )
        op.create_index(op.f('ix_users_supabase_user_id'), 'users', ['supabase_user_id'], unique=True)

    # Create profiles table (skip if already exists)
    if not conn.dialect.has_table(conn, 'profiles'):
        op.create_table(
            'profiles',
            sa.Column('id', sa.String(length=36), primary_key=True),
            sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
            sa.Column('full_name', sa.String(), nullable=True),
            sa.Column('education_level', sa.String(), nullable=True),
            sa.Column('institution', sa.String(), nullable=True),
            sa.Column('graduation_year', sa.Integer(), nullable=True),
            sa.Column('interests', sa.JSON().with_variant(postgresql.ARRAY(sa.String()), 'postgresql'), nullable=True),
            sa.Column('bio', sa.Text(), nullable=True),
            sa.Column('onboarding_completed', sa.Boolean(), nullable=False, server_default=sa.text('false')),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
            sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        )
        if conn.dialect.name == 'postgresql':
            conn.execute(sa.text("ALTER TABLE profiles ALTER COLUMN education_level TYPE education_level_enum USING education_level::education_level_enum"))


def downgrade() -> None:
    op.drop_table('profiles')
    op.drop_index(op.f('ix_users_supabase_user_id'), table_name='users')
    op.drop_table('users')
    conn = op.get_bind()
    if conn.dialect.name == 'postgresql':
        conn.execute(sa.text('DROP TYPE IF EXISTS education_level_enum'))
