print("Running rule-based scoring test")

import preprocessing.normalization as norm
from scoring.rule_based_scoring import compute_rule_score

record_A = {
    "name_norm": norm.normalize_name("Rahul Kumar"),
    "father_norm": norm.normalize_name("Suresh Kumar"),
    "dob": norm.normalize_dob("1999-08-12"),
    "mobile_norm": norm.normalize_mobile("9876543210"),
    "address_norm": norm.normalize_address("Jaipur Rajasthan"),
    "photo_emb": None
}

record_B = {
    "name_norm": norm.normalize_name("Rahul  Kumar"),
    "father_norm": norm.normalize_name("Suresh Kumar"),
    "dob": norm.normalize_dob("1999-08-12"),
    "mobile_norm": norm.normalize_mobile("9876543210"),
    "address_norm": norm.normalize_address("Jaipur Rajasthan"),
    "photo_emb": None
}

score = compute_rule_score(record_A, record_B)

print("Rule-based score:", score)
