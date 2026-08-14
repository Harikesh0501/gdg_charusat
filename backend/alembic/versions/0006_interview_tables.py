"""interview tables

Revision ID: 0006_interview
Revises: 0005_recommendations
Create Date: 2026-08-14 01:35:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0006_interview'
down_revision: Union[str, None] = '0005_recommendations'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # Create ENUM types for Postgres if using Postgres
    if conn.dialect.name == 'postgresql':
        conn.execute(sa.text("""
            DO $$ BEGIN
                CREATE TYPE question_category_enum AS ENUM ('technical', 'behavioral', 'project_specific', 'role_specific');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        """))
        conn.execute(sa.text("""
            DO $$ BEGIN
                CREATE TYPE question_source_enum AS ENUM ('seed', 'ai_generated');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        """))

        category_type = postgresql.ENUM('technical', 'behavioral', 'project_specific', 'role_specific', name='question_category_enum', create_type=False)
        source_type = postgresql.ENUM('seed', 'ai_generated', name='question_source_enum', create_type=False)
        uuid_type = postgresql.UUID(as_uuid=True)
    else:
        category_type = sa.Enum('technical', 'behavioral', 'project_specific', 'role_specific', name='question_category_enum')
        source_type = sa.Enum('seed', 'ai_generated', name='question_source_enum')
        uuid_type = sa.String(length=36)

    # Create interview_questions table
    if not conn.dialect.has_table(conn, 'interview_questions'):
        op.create_table(
            'interview_questions',
            sa.Column('id', uuid_type, nullable=False),
            sa.Column('career_role_id', sa.Integer(), nullable=True),
            sa.Column('skill_id', sa.Integer(), nullable=True),
            sa.Column('category', category_type, nullable=False, server_default='technical'),
            sa.Column('difficulty', sa.Integer(), nullable=False, server_default='2'),
            sa.Column('question_text', sa.Text(), nullable=False),
            sa.Column('ideal_answer_points', sa.JSON(), nullable=True),
            sa.Column('source', source_type, nullable=False, server_default='seed'),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
            sa.ForeignKeyConstraint(['career_role_id'], ['career_roles.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_interview_questions_career_role_id', 'interview_questions', ['career_role_id'])
        op.create_index('ix_interview_questions_skill_id', 'interview_questions', ['skill_id'])

    # Create interview_attempts table
    if not conn.dialect.has_table(conn, 'interview_attempts'):
        op.create_table(
            'interview_attempts',
            sa.Column('id', uuid_type, nullable=False),
            sa.Column('profile_id', uuid_type, nullable=False),
            sa.Column('question_id', uuid_type, nullable=False),
            sa.Column('answer_text', sa.Text(), nullable=False),
            sa.Column('score', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('strengths', sa.JSON(), nullable=True),
            sa.Column('weaknesses', sa.JSON(), nullable=True),
            sa.Column('feedback', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
            sa.ForeignKeyConstraint(['profile_id'], ['profiles.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['question_id'], ['interview_questions.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_interview_attempts_profile_id', 'interview_attempts', ['profile_id'])
        op.create_index('ix_interview_attempts_question_id', 'interview_attempts', ['question_id'])


def downgrade() -> None:
    op.drop_index('ix_interview_attempts_question_id', table_name='interview_attempts')
    op.drop_index('ix_interview_attempts_profile_id', table_name='interview_attempts')
    op.drop_table('interview_attempts')

    op.drop_index('ix_interview_questions_skill_id', table_name='interview_questions')
    op.drop_index('ix_interview_questions_career_role_id', table_name='interview_questions')
    op.drop_table('interview_questions')

    conn = op.get_bind()
    if conn.dialect.name == 'postgresql':
        conn.execute(sa.text("DROP TYPE IF EXISTS question_source_enum;"))
        conn.execute(sa.text("DROP TYPE IF EXISTS question_category_enum;"))
