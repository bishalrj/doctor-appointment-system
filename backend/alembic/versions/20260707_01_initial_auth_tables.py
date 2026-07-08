"""Initial auth tables (users, patient_profiles, doctor_profiles)

Revision ID: 20260707_01
Revises: 
Create Date: 2026-07-07 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20260707_01'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)
    op.create_index(op.f('ix_users_is_deleted'), 'users', ['is_deleted'], unique=False)

    # 2. Create patient_profiles table
    op.create_table(
        'patient_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=False),
        sa.Column('last_name', sa.String(length=100), nullable=False),
        sa.Column('phone_number', sa.String(length=50), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=True),
        sa.Column('blood_group', sa.String(length=10), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('emergency_contact', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_patient_profiles_user_id'), 'patient_profiles', ['user_id'], unique=True)

    # 3. Create doctor_profiles table
    op.create_table(
        'doctor_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=False),
        sa.Column('last_name', sa.String(length=100), nullable=False),
        sa.Column('specialization', sa.String(length=150), nullable=False),
        sa.Column('license_number', sa.String(length=100), nullable=False),
        sa.Column('qualification', sa.String(length=255), nullable=False),
        sa.Column('experience_years', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('consultation_fee', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0.00'),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('license_number'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_doctor_profiles_license_number'), 'doctor_profiles', ['license_number'], unique=True)
    op.create_index(op.f('ix_doctor_profiles_specialization'), 'doctor_profiles', ['specialization'], unique=False)
    op.create_index(op.f('ix_doctor_profiles_user_id'), 'doctor_profiles', ['user_id'], unique=True)


def downgrade() -> None:
    op.drop_table('doctor_profiles')
    op.drop_table('patient_profiles')
    op.drop_table('users')
