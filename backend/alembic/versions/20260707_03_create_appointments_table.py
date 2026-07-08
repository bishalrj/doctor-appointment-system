"""Create appointments table

Revision ID: 20260707_03
Revises: 20260707_02
Create Date: 2026-07-07 23:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20260707_03'
down_revision: Union[str, None] = '20260707_02'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'appointments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('doctor_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('appointment_date', sa.Date(), nullable=False),
        sa.Column('start_time', sa.String(length=10), nullable=False),
        sa.Column('end_time', sa.String(length=10), nullable=False),
        sa.Column('reason_for_visit', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='PENDING'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['doctor_id'], ['doctor_profiles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['patient_id'], ['patient_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_appointments_patient_id'), 'appointments', ['patient_id'], unique=False)
    op.create_index(op.f('ix_appointments_doctor_id'), 'appointments', ['doctor_id'], unique=False)
    op.create_index(op.f('ix_appointments_appointment_date'), 'appointments', ['appointment_date'], unique=False)
    op.create_index(op.f('ix_appointments_status'), 'appointments', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_appointments_status'), table_name='appointments')
    op.drop_index(op.f('ix_appointments_appointment_date'), table_name='appointments')
    op.drop_index(op.f('ix_appointments_doctor_id'), table_name='appointments')
    op.drop_index(op.f('ix_appointments_patient_id'), table_name='appointments')
    op.drop_table('appointments')
