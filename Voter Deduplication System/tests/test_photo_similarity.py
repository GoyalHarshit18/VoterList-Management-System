import sys
import os

# Add project root to path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, PROJECT_ROOT)

from preprocessing.normalization import (
    normalize_name,
    normalize_address,
    normalize_mobile,
    normalize_dob
)

from scoring.rule_based_scoring import compute_rule_score


# -----------------------------
# HELPER: CREATE RECORD FORMAT
# -----------------------------
def make_record(name, father, dob, mobile, address, photo_emb=None):
    return {
        "name_norm": normalize_name(name),
        "father_norm": normalize_name(father),
        "dob": normalize_dob(dob),
        "mobile_norm": normalize_mobile(mobile),
        "address_norm": normalize_address(address),
        "photo_emb": photo_emb  # None for now
    }


# -----------------------------
# TEST CASE 1: DUPLICATE
# -----------------------------
record_A = make_record(
    name="Rahul Kumar",
    father="Suresh Kumar",
    dob="1999-08-12",
    mobile="9876543210",
    address="Jaipur Rajasthan"
)

record_B = make_record(
    name="Rahul  Kumar",
    father="Suresh Kumar",
    dob="1999-08-12",
    mobile="9876543210",
    address="Jaipur, Rajasthan"
)

score_1 = compute_rule_score(record_A, record_B)

print("\nTEST 1: CLEAR DUPLICATE")
print("Score:", score_1)


# -----------------------------
# TEST CASE 2: NOT DUPLICATE
# -----------------------------
record_C = make_record(
    name="Amit Sharma",
    father="Rajesh Sharma",
    dob="1985-01-01",
    mobile="9123456789",
    address="Delhi India"
)

score_2 = compute_rule_score(record_A, record_C)

print("\nTEST 2: NOT DUPLICATE")
print("Score:", score_2)


# -----------------------------
# TEST CASE 3: MANUAL CHECK
# -----------------------------
record_D = make_record(
    name="Rahul Kumar",
    father="Suresh Kumar",
    dob="1999-08-12",
    mobile="9999999999",
    address="Jaipur"
)

score_3 = compute_rule_score(record_A, record_D)

print("\nTEST 3: MANUAL CHECK")
print("Score:", score_3)
