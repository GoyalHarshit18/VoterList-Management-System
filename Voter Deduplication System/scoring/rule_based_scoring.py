from rapidfuzz import fuzz


def compute_rule_score(record_a, record_b):
    """
    Returns rule-based similarity score between 0 and 100
    """

    score = 0

    # -----------------------------
    # DOB (20)
    # -----------------------------
    if record_a["dob"] and record_b["dob"]:
        if record_a["dob"] == record_b["dob"]:
            score += 20

    # -----------------------------
    # Name similarity (20)
    # -----------------------------
    name_sim = fuzz.token_sort_ratio(
        record_a["name_norm"], record_b["name_norm"]
    )
    score += 20 * (name_sim / 100)

    # -----------------------------
    # Father name similarity (20)
    # -----------------------------
    father_sim = fuzz.token_sort_ratio(
        record_a["father_norm"], record_b["father_norm"]
    )
    score += 20 * (father_sim / 100)

    # -----------------------------
    # Mobile (10)
    # -----------------------------
    if (
        record_a["mobile_norm"]
        and record_b["mobile_norm"]
        and record_a["mobile_norm"] == record_b["mobile_norm"]
    ):
        score += 10

    # -----------------------------
    # Address similarity (10)
    # -----------------------------
    addr_sim = fuzz.token_sort_ratio(
        record_a["address_norm"], record_b["address_norm"]
    )
    score += 10 * (addr_sim / 100)

    # -----------------------------
    # Photograph placeholder (20)
    # (Handled separately by ML)
    # -----------------------------

    return round(score, 2)
