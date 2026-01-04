import numpy as np
from deepface import DeepFace
from sklearn.metrics.pairwise import cosine_similarity


def extract_face_embedding(image_path):
    """
    Extracts a face embedding using FaceNet.
    Returns a numpy array or None.
    """
    try:
        result = DeepFace.represent(
            img_path=image_path,
            model_name="Facenet",
            enforce_detection=False
        )
        return np.array(result[0]["embedding"])
    except Exception as e:
        print("Face embedding error:", e)
        return None


def face_similarity(emb1, emb2):
    """
    Computes cosine similarity between two embeddings.
    Returns value between 0 and 1.
    """
    if emb1 is None or emb2 is None:
        return 0.0

    sim = cosine_similarity([emb1], [emb2])[0][0]
    return float(max(0.0, min(1.0, sim)))


def photo_match_score(image_path_1, image_path_2):
    """
    FULL PHOTO ML PIPELINE:
    image → embedding → similarity
    """
    emb1 = extract_face_embedding(image_path_1)
    emb2 = extract_face_embedding(image_path_2)

    return face_similarity(emb1, emb2)
