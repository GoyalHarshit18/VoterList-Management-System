import sys
import os

# -----------------------------
# Add project root to path
# -----------------------------
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, PROJECT_ROOT)

import preprocessing.normalization as norm
from pipeline.dedup_pipeline import run_dedup


# -------------------------------
# RECORD A (Voter 1)
# -------------------------------
record_A = {
    "name_norm": norm.normalize_name("Rahul Kumar"),
    "father_norm": norm.normalize_name("Suresh Kumar"),
    "dob": norm.normalize_dob("1999-08-12"),
    "mobile_norm": norm.normalize_mobile("9876543210"),
    "address_norm": norm.normalize_address("Jaipur Rajasthan"),
}

# -------------------------------
# RECORD B (Voter 2)
# -------------------------------
record_B = {
    "name_norm": norm.normalize_name("Rahul  Kumar"),
    "father_norm": norm.normalize_name("Suresh Kumar"),
    "dob": norm.normalize_dob("1999-08-12"),
    "mobile_norm": norm.normalize_mobile("9876543210"),
    "address_norm": norm.normalize_address("Jaipur Rajasthan"),
}

# -------------------------------
# REAL IMAGE PATHS
# -------------------------------
img1 = os.path.join(PROJECT_ROOT, "lfw-deepfunneled", "George_W_Bush", "George_W_Bush_0001.jpg")
img2 = os.path.join(PROJECT_ROOT, "lfw-deepfunneled", "George_W_Bush", "George_W_Bush_0002.jpg")

# -------------------------------
# RUN FULL PIPELINE
# -------------------------------
result = run_dedup(record_A, record_B, img1, img2)

print("\nFULL DEDUPLICATION RESULT")
for k, v in result.items():
    print(f"{k}: {v}")
