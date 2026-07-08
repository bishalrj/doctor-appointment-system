"""Add Phase 2 doctor management columns and doctor_availability table

Revision ID: 20260707_02
Revises: 20260707_01
Create Date: 2026-07-07 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20260707_02'
down_revision: Union[str, None] = '20260707_01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add new columns to doctor_profiles
    op.add_column('doctor_profiles', sa.Column('profile_photo', sa.String(length=500), nullable=True))
    op.add_column('doctor_profiles', sa.Column('hospital_clinic', sa.String(length=255), nullable=True))
    op.add_column('doctor_profiles', sa.Column('languages', sa.String(length=255), nullable=True))
    op.add_column('doctor_profiles', sa.Column('address', sa.Text(), nullable=True))
    op.add_column('doctor_profiles', sa.Column('city', sa.String(length=100), nullable=True))
    op.add_column('doctor_profiles', sa.Column('state', sa.String(length=100), nullable=True))
    op.add_column('doctor_profiles', sa.Column('country', sa.String(length=100), nullable=True))
    op.add_column('doctor_profiles', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))

    op.create_index(op.f('ix_doctor_profiles_city'), 'doctor_profiles', ['city'], unique=False)
    op.create_index(op.f('ix_doctor_profiles_is_active'), 'doctor_profiles', ['is_active'], unique=False)
    op.create_index(op.f('ix_doctor_profiles_is_verified'), 'doctor_profiles', ['is_verified'], unique=False)

    # 2. Create doctor_availability table
    op.create_table(
        'doctor_availability',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('doctor_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('day_of_week', sa.String(length=20), nullable=False),
        sa.Column('start_time', sa.String(length=10), nullable=False),
        sa.Column('end_time', sa.String(length=10), nullable=False),
        sa.Column('slot_duration', sa.Integer(), nullable=False, server_default='30'),
        sa.Column('break_start', sa.String(length=10), nullable=True),
        sa.Column('break_end', sa.String(length=10), nullable=True),
        sa.Column('is_available', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['doctor_id'], ['doctor_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_doctor_availability_doctor_id'), 'doctor_availability', ['doctor_id'], unique=False)
    op.create_index(op.f('ix_doctor_availability_day_of_week'), 'doctor_availability', ['day_of_week'], unique=False)


def downgrade() -> None:
    op.drop_table('doctor_availability')

    op.drop_index(op.f('ix_doctor_profiles_is_verified'), table_name='doctor_profiles')
    op.drop_index(op.f('ix_doctor_profiles_is_active'), table_name='doctor_profiles')
    op.drop_index(op.f('ix_doctor_profiles_city'), table_name='doctor_profiles')

    op.drop_column('doctor_profiles', 'is_active')
    op.drop_column('doctor_profiles', 'country')
    op.drop_column('doctor_profiles', 'state')
    op.drop_column('doctor_profiles', 'city')
    op.drop_column('doctor_profiles', 'address')
    op.drop_column('doctor_profiles', 'languages')
    op.drop_column('doctor_profiles', 'hospital_clinic')
    op.drop_column('doctor_profiles', 'profile_photo')
