"""initial users and profiles

Revision ID: 0001_initial_users_and_profiles
Revises: 
Create Date: 2026-08-11 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0001_initial_users_and_profiles'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum type
    education_level_enum = postgresql.ENUM('high_school', 'undergraduate', 'postgraduate', 'other', name='education_level_enum')
    education_level_enum.create(op.get_bind(), checkfirst=True)

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('supabase_user_id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index(op.f('ix_users_supabase_user_id'), 'users', ['supabase_user_id'], unique=True)

    # Create profiles table
    op.create_table(
        'profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('education_level', sa.Enum('high_school', 'undergraduate', 'postgraduate', 'other', name='education_level_enum'), nullable=True),
        sa.Column('institution', sa.String(), nullable=True),
        sa.Column('graduation_year', sa.Integer(), nullable=True),
        sa.Column('interests', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('onboarding_completed', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )


def downgrade() -> None:
    op.drop_table('profiles')
    op.drop_index(op.f('ix_users_supabase_user_id'), table_name='users')
    op.drop_table('users')
    op.execute('DROP TYPE IF EXISTS education_level_enum')
