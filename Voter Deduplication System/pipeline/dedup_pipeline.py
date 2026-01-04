from scoring.rule_based_scoring import compute_rule_score
from photo_ml.face_embedding import photo_match_score


def run_dedup(record_a, record_b, img_path_a, img_path_b):
    """
    Full deduplication pipeline using:
    - Rule-based identity matching
    - Real photo similarity (DeepFace)
    """

    # 1. Rule-based score (0–100)
    rule_score = compute_rule_score(record_a, record_b)

    # 2. Photo similarity (0–1) — REAL ML
    photo_score = photo_match_score(img_path_a, img_path_b)

    # 3. Final confidence (0–100)
    final_confidence = (
        0.7 * (rule_score / 100) +
        0.3 * photo_score
    ) * 100

    # 4. Decision logic
    if final_confidence >= 80:
        decision = "DUPLICATE"
    elif final_confidence >= 60:
        decision = "MANUAL_REVIEW"
    else:
        decision = "NOT_DUPLICATE"

    return {
        "rule_score": round(rule_score, 2),
        "photo_score": round(photo_score, 3),
        "final_confidence": round(final_confidence, 2),
        "decision": decision
    }
