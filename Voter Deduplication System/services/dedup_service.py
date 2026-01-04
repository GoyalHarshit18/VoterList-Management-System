from scoring.rule_based_scoring import compute_rule_score
from photo_ml.face_embedding import photo_match_score
from db.models import DedupRun, Voter, ManualReview
from datetime import datetime


def run_deduplication(application, db):
    voters = db.query(Voter).all()

    best_score = 0
    best_decision = "NOT_DUPLICATE"

    for voter in voters:
        # Note: application.__dict__ and voter.__dict__ are passed to compute_rule_score
        rule_score = compute_rule_score(application.__dict__, voter.__dict__)
        
        # photo_path is used for photo matching
        photo_score = photo_match_score(application.photo_path, voter.photo_path)

        final_confidence = (
            0.7 * (rule_score / 100) +
            0.3 * photo_score
        ) * 100

        if final_confidence >= 80:
            decision = "DUPLICATE"
        elif final_confidence >= 60:
            decision = "MANUAL_REVIEW"
        else:
            decision = "NOT_DUPLICATE"

        db.add(DedupRun(
            application_id=application.application_id,
            existing_voter_id=voter.voter_id,
            rule_score=rule_score,
            photo_score=photo_score,
            final_confidence=final_confidence,
            decision=decision
        ))

        if final_confidence > best_score:
            best_score = final_confidence
            best_decision = decision

    return best_decision, best_score
