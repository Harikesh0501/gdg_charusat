"""resume processing and skills

Revision ID: 0002_resume_processing_and_skills
Revises: 0001_initial_users_and_profiles
Create Date: 2026-08-11 15:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0002_resume_processing_and_skills'
down_revision: Union[str, None] = '0001_initial_users_and_profiles'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enums
    skill_category_enum = postgresql.ENUM('programming_language', 'framework_library', 'database', 'cloud_devops', 'data_ml', 'tool', 'soft_skill', 'concept', name='skill_category_enum')
    skill_category_enum.create(op.get_bind(), checkfirst=True)

    skill_source_enum = postgresql.ENUM('resume', 'self_reported', 'inferred', 'assessment', name='skill_source_enum')
    skill_source_enum.create(op.get_bind(), checkfirst=True)

    resume_status_enum = postgresql.ENUM('uploaded', 'processing', 'processed', 'failed', name='resume_status_enum')
    resume_status_enum.create(op.get_bind(), checkfirst=True)

    project_source_enum = postgresql.ENUM('resume', 'manual', name='project_source_enum')
    project_source_enum.create(op.get_bind(), checkfirst=True)

    # skills table
    op.create_table(
        'skills',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False, unique=True),
        sa.Column('category', sa.Enum('programming_language', 'framework_library', 'database', 'cloud_devops', 'data_ml', 'tool', 'soft_skill', 'concept', name='skill_category_enum'), nullable=False),
        sa.Column('aliases', postgresql.ARRAY(sa.String()), nullable=False, server_default='{}'),
        sa.Column('parent_skill_id', sa.Integer(), sa.ForeignKey('skills.id', ondelete='SET NULL'), nullable=True),
        sa.Column('difficulty', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('description', sa.Text(), nullable=True),
    )
    op.create_index(op.f('ix_skills_slug'), 'skills', ['slug'], unique=True)
    op.create_index(op.f('ix_skills_category'), 'skills', ['category'], unique=False)

    # skill_prerequisites table
    op.create_table(
        'skill_prerequisites',
        sa.Column('skill_id', sa.Integer(), sa.ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('prerequisite_skill_id', sa.Integer(), sa.ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True),
    )

    # student_skills table
    op.create_table(
        'student_skills',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('profile_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_id', sa.Integer(), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
        sa.Column('proficiency', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('source', sa.Enum('resume', 'self_reported', 'inferred', 'assessment', name='skill_source_enum'), nullable=False, server_default='resume'),
        sa.Column('confidence', sa.Float(), nullable=False, server_default='0.7'),
        sa.Column('evidence', sa.Text(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.UniqueConstraint('profile_id', 'skill_id', name='uq_student_skills_profile_skill'),
    )

    # resumes table
    op.create_table(
        'resumes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('profile_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('file_name', sa.String(), nullable=False),
        sa.Column('file_url', sa.String(), nullable=False),
        sa.Column('status', sa.Enum('uploaded', 'processing', 'processed', 'failed', name='resume_status_enum'), nullable=False, server_default='uploaded'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )

    # resume_extractions table
    op.create_table(
        'resume_extractions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('resume_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('profile_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('raw_text', sa.Text(), nullable=False),
        sa.Column('extracted_json', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )

    # profile_projects table
    op.create_table(
        'profile_projects',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('profile_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('skill_ids', postgresql.ARRAY(sa.Integer()), nullable=True),
        sa.Column('source', sa.Enum('resume', 'manual', name='project_source_enum'), nullable=False, server_default='resume'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )


def downgrade() -> None:
    op.drop_table('profile_projects')
    op.drop_table('resume_extractions')
    op.drop_table('resumes')
    op.drop_table('student_skills')
    op.drop_table('skill_prerequisites')
    op.drop_index(op.f('ix_skills_category'), table_name='skills')
    op.drop_index(op.f('ix_skills_slug'), table_name='skills')
    op.drop_table('skills')

    op.execute('DROP TYPE IF EXISTS project_source_enum')
    op.execute('DROP TYPE IF EXISTS resume_status_enum')
    op.execute('DROP TYPE IF EXISTS skill_source_enum')
    op.execute('DROP TYPE IF EXISTS skill_category_enum')
