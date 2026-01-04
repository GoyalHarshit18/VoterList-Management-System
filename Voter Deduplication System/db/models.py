from sqlalchemy import (
    Column, String, Date, Float, Text, ForeignKey, DateTime
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid
from datetime import datetime

Base = declarative_base()


class VoterApplication(Base):
    __tablename__ = "voter_applications"

    application_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    name_raw = Column(Text)
    father_name_raw = Column(Text)
    dob = Column(Date)
    mobile = Column(Text)
    address_raw = Column(Text)

    name_norm = Column(Text)
    father_norm = Column(Text)
    mobile_norm = Column(Text)
    address_norm = Column(Text)

    photo_path = Column(Text)

    application_status = Column(
        String, default="PENDING"
    )

    created_at = Column(DateTime, default=datetime.utcnow)


class Voter(Base):
    __tablename__ = "voters"

    voter_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    name_raw = Column(Text)
    father_name_raw = Column(Text)
    dob = Column(Date)
    mobile = Column(Text)
    address_raw = Column(Text)

    name_norm = Column(Text)
    father_norm = Column(Text)
    mobile_norm = Column(Text)
    address_norm = Column(Text)

    photo_path = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)


class DedupRun(Base):
    __tablename__ = "dedup_runs"

    run_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    application_id = Column(UUID(as_uuid=True), ForeignKey("voter_applications.application_id"))
    existing_voter_id = Column(UUID(as_uuid=True), ForeignKey("voters.voter_id"))

    rule_score = Column(Float)
    photo_score = Column(Float)
    final_confidence = Column(Float)

    decision = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class ManualReview(Base):
    __tablename__ = "manual_reviews"

    review_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    application_id = Column(UUID(as_uuid=True), ForeignKey("voter_applications.application_id"))

    reviewer_name = Column(Text)
    reviewer_decision = Column(Text)
    reviewer_notes = Column(Text)
    reviewed_at = Column(DateTime)
