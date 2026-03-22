import os
from google import genai

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.getenv("GEMINI_API_KEY", ""))
    return _client


def generate_embedding(text):
    if not os.getenv("GEMINI_API_KEY"):
        return None
    try:
        result = _get_client().models.embed_content(
            model="gemini-embedding-001",
            contents=text[:2000],
        )
        return result.embeddings[0].values
    except Exception:
        return None
