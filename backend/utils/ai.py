import os
from google import genai

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.getenv("GEMINI_API_KEY", ""))
    return _client


def generate_content_suggestion(content_type, society_name, university, draft=""):
    if not os.getenv("GEMINI_API_KEY"):
        return None
    try:
        if content_type == "post":
            prompt = (
                f"Write a short society update post (2-3 sentences, casual and engaging) "
                f"for '{society_name}' at {university}."
                + (f" Draft: {draft}" if draft else "")
                + " Return only the post text, no extra commentary."
            )
        else:
            prompt = (
                f"Write a short event description (2-3 sentences, enthusiastic) "
                f"for '{society_name}' at {university}."
                + (f" Context: {draft}" if draft else "")
                + " Return only the description text, no extra commentary."
            )
        response = _get_client().models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return response.text.strip()
    except Exception:
        return None
