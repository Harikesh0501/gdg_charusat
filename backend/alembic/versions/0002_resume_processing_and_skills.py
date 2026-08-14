"""resume processing and skills

Revision ID: 0002_skills
Revises: 0001_init
Create Date: 2026-08-11 15:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0002_skills'
down_revision: Union[str, None] = '0001_init'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    if conn.dialect.name == 'postgresql':
        conn.execute(sa.text("""
            DO $$ BEGIN
                CREATE TYPE skill_category_enum AS ENUM ('programming_language', 'framework_library', 'database', 'cloud_devops', 'data_ml', 'tool', 'soft_skill', 'concept');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        """))
        conn.execute(sa.text("""
            DO $$ BEGIN
                CREATE TYPE skill_source_enum AS ENUM ('resume', 'self_reported', 'inferred', 'assessment');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        """))
        conn.execute(sa.text("""
            DO $$ BEGIN
                CREATE TYPE resume_status_enum AS ENUM ('uploaded', 'processing', 'processed', 'failed');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        """))
        conn.execute(sa.text("""
            DO $$ BEGIN
                CREATE TYPE project_source_enum AS ENUM ('resume', 'manual');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        """))

    # skills table
    if not conn.dialect.has_table(conn, 'skills'):
        op.create_table(
            'skills',
            sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('slug', sa.String(), nullable=False, unique=True),
            sa.Column('category', sa.String(), nullable=False),
            sa.Column('aliases', sa.JSON().with_variant(postgresql.ARRAY(sa.String()), 'postgresql'), nullable=False, server_default='[]'),
            sa.Column('parent_skill_id', sa.Integer(), sa.ForeignKey('skills.id', ondelete='SET NULL'), nullable=True),
            sa.Column('difficulty', sa.Integer(), nullable=False, server_default='1'),
            sa.Column('description', sa.Text(), nullable=True),
        )
        if conn.dialect.name == 'postgresql':
            conn.execute(sa.text("ALTER TABLE skills ALTER COLUMN category TYPE skill_category_enum USING category::skill_category_enum"))
        op.create_index(op.f('ix_skills_slug'), 'skills', ['slug'], unique=True)
        op.create_index(op.f('ix_skills_category'), 'skills', ['category'], unique=False)

    # skill_prerequisites table
    if not conn.dialect.has_table(conn, 'skill_prerequisites'):
        op.create_table(
            'skill_prerequisites',
            sa.Column('skill_id', sa.Integer(), sa.ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True),
            sa.Column('prerequisite_skill_id', sa.Integer(), sa.ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True),
        )

    # student_skills table
    if not conn.dialect.has_table(conn, 'student_skills'):
        op.create_table(
            'student_skills',
            sa.Column('id', sa.String(length=36), primary_key=True),
            sa.Column('profile_id', sa.String(length=36), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
            sa.Column('skill_id', sa.Integer(), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
            sa.Column('proficiency', sa.Integer(), nullable=False, server_default='1'),
            sa.Column('source', sa.String(), nullable=False, server_default='resume'),
            sa.Column('confidence', sa.Float(), nullable=False, server_default='0.7'),
            sa.Column('evidence', sa.Text(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
            sa.UniqueConstraint('profile_id', 'skill_id', name='uq_student_skills_profile_skill'),
        )
        if conn.dialect.name == 'postgresql':
            conn.execute(sa.text("ALTER TABLE student_skills ALTER COLUMN source DROP DEFAULT"))
            conn.execute(sa.text("ALTER TABLE student_skills ALTER COLUMN source TYPE skill_source_enum USING source::skill_source_enum"))
            conn.execute(sa.text("ALTER TABLE student_skills ALTER COLUMN source SET DEFAULT 'resume'::skill_source_enum"))

    # resumes table
    if not conn.dialect.has_table(conn, 'resumes'):
        op.create_table(
            'resumes',
            sa.Column('id', sa.String(length=36), primary_key=True),
            sa.Column('profile_id', sa.String(length=36), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
            sa.Column('file_name', sa.String(), nullable=False),
            sa.Column('file_url', sa.String(), nullable=False),
            sa.Column('status', sa.String(), nullable=False, server_default='uploaded'),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
            sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        )
        if conn.dialect.name == 'postgresql':
            conn.execute(sa.text("ALTER TABLE resumes ALTER COLUMN status DROP DEFAULT"))
            conn.execute(sa.text("ALTER TABLE resumes ALTER COLUMN status TYPE resume_status_enum USING status::resume_status_enum"))
            conn.execute(sa.text("ALTER TABLE resumes ALTER COLUMN status SET DEFAULT 'uploaded'::resume_status_enum"))

    # resume_extractions table
    if not conn.dialect.has_table(conn, 'resume_extractions'):
        op.create_table(
            'resume_extractions',
            sa.Column('id', sa.String(length=36), primary_key=True),
            sa.Column('resume_id', sa.String(length=36), sa.ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False),
            sa.Column('profile_id', sa.String(length=36), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
            sa.Column('raw_text', sa.Text(), nullable=False),
            sa.Column('extracted_json', sa.JSON().with_variant(postgresql.JSON(astext_type=sa.Text()), 'postgresql'), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        )

    # profile_projects table
    if not conn.dialect.has_table(conn, 'profile_projects'):
        op.create_table(
            'profile_projects',
            sa.Column('id', sa.String(length=36), primary_key=True),
            sa.Column('profile_id', sa.String(length=36), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
            sa.Column('title', sa.String(), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('skill_ids', sa.JSON().with_variant(postgresql.ARRAY(sa.Integer()), 'postgresql'), nullable=True),
            sa.Column('source', sa.String(), nullable=False, server_default='resume'),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        )
        if conn.dialect.name == 'postgresql':
            conn.execute(sa.text("ALTER TABLE profile_projects ALTER COLUMN source DROP DEFAULT"))
            conn.execute(sa.text("ALTER TABLE profile_projects ALTER COLUMN source TYPE project_source_enum USING source::project_source_enum"))
            conn.execute(sa.text("ALTER TABLE profile_projects ALTER COLUMN source SET DEFAULT 'resume'::project_source_enum"))


def downgrade() -> None:
    op.drop_table('profile_projects')
    op.drop_table('resume_extractions')
    op.drop_table('resumes')
    op.drop_table('student_skills')
    op.drop_table('skill_prerequisites')
    op.drop_index(op.f('ix_skills_category'), table_name='skills')
    op.drop_index(op.f('ix_skills_slug'), table_name='skills')
    op.drop_table('skills')

    conn = op.get_bind()
    if conn.dialect.name == 'postgresql':
        conn.execute(sa.text('DROP TYPE IF EXISTS project_source_enum'))
        conn.execute(sa.text('DROP TYPE IF EXISTS resume_status_enum'))
        conn.execute(sa.text('DROP TYPE IF EXISTS skill_source_enum'))
        conn.execute(sa.text('DROP TYPE IF EXISTS skill_category_enum'))
