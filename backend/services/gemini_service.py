import logging
import requests
from core.config import settings

logger = logging.getLogger("uvicorn.error")

def check_gemini_status() -> dict:
    """Returns Gemini API key configuration and readiness status."""
    has_key = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key")
    if has_key:
        return {
            "status": "configured",
            "model": "Gemini 1.5/2.0 Flash",
            "api_key_configured": True,
            "message": "Google Gemini AI API key active & configured."
        }
    return {
        "status": "mock",
        "model": "Built-in Academic Report Generator Engine",
        "api_key_configured": False,
        "message": "Gemini API key missing or placeholder (falling back to built-in structured narrative engine)."
    }

def call_gemini_api(prompt_text: str) -> str:
    """Calls Gemini REST API trying models: gemini-2.5-flash, gemini-flash-latest, gemini-2.5-pro."""
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your_gemini_api_key":
        return None

    models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-pro", "gemini-pro-latest"]
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt_text}
                ]
            }
        ]
    }
    
    for model in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.GEMINI_API_KEY}"
            resp = requests.post(url, json=payload, timeout=20)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text
            else:
                logger.warning(f"Gemini API model {model} returned status {resp.status_code}: {resp.text}")
        except Exception as e:
            logger.error(f"Gemini API call error for model {model}: {e}")

    return None

async def generate_activity_report_narrative(activity: dict, media_items: list = None) -> str:
    """Generates structured formal academic activity report using Gemini AI."""
    media_summary = f"{len(media_items)} photographic/video documentations attached." if media_items else "No media attached."
    
    system_prompt = (
        "You are a professional academic report writer for the School of Computer Applications, "
        "Union Christian College, Aluva (Autonomous). Write a formal activity report using the "
        "following structured sections in clean Markdown format:\n\n"
        "### 1. Executive Summary & Introduction\n"
        "### 2. Event Proceedings & Detailed Activities\n"
        "### 3. Key Highlights & Resource Person Contributions\n"
        "### 4. Outcomes and Student Learning Objectives\n"
        "### 5. Conclusion & Recommendations\n\n"
        "Maintain a formal, professional, and academic tone suitable for accreditation and department records."
    )

    user_prompt = (
        f"Activity Title: {activity.get('title')}\n"
        f"Category: {activity.get('category')}\n"
        f"Date: {activity.get('activity_date')}\n"
        f"Venue: {activity.get('venue')}\n"
        f"Resource Person: {activity.get('resource_person', 'N/A')}\n"
        f"Participants Count: {activity.get('participants_count', 0)}\n"
        f"Description: {activity.get('description')}\n"
        f"Key Outcomes: {activity.get('outcomes', 'N/A')}\n"
        f"Media Documentations: {media_summary}\n"
    )

    full_prompt = system_prompt + "\n\n" + user_prompt
    ai_text = call_gemini_api(full_prompt)
    if ai_text:
        return ai_text

    # High quality fallback narrative generator
    return f"""### 1. Executive Summary & Introduction
The School of Computer Applications, Union Christian College, Aluva (Autonomous) organized an insightful **{activity.get('category')}** titled **"{activity.get('title')}"** on **{activity.get('activity_date')}** at **{activity.get('venue')}**. The event brought together **{activity.get('participants_count', 'numerous')} participants** including students, research scholars, and faculty members.

### 2. Event Proceedings & Detailed Activities
{activity.get('description')}
The session commenced with an inaugural address highlighting the relevance of computing advancements, followed by interactive modules led by domain experts.

### 3. Key Highlights & Resource Person Contributions
- **Distinguished Speaker / Resource Person**: {activity.get('resource_person', 'Internal Department Faculty')}
- Active participation and practical Q&A sessions.
- Comprehensive coverage of theoretical foundations and practical applications.

### 4. Outcomes and Student Learning Objectives
{activity.get('outcomes', 'Participants gained actionable knowledge, enhanced practical domain understanding, and acquired skills relevant to industry standard computing practices.')}

### 5. Conclusion & Recommendations
The program concluded successfully with unanimous positive feedback from participants. The department records its appreciation to the management, organizing team, and participants for making this initiative a grand success."""


async def generate_annual_report_narrative(year: int, activities: list) -> str:
    """Generates annual department summary narrative across all activities for a given year."""
    system_prompt = (
        "You are an HOD report synthesizer for the School of Computer Applications, "
        "Union Christian College, Aluva. Synthesize an Annual Departmental Performance Summary "
        "for the academic year in professional academic report style with sections: Executive Overview, "
        "Academic & Co-Curricular Initiatives, Category Breakdown & Metrics, Student Outcomes, and Future Outlook."
    )
    
    activities_summary = "\n".join([
        f"- [{act.get('category')}] {act.get('title')} ({act.get('activity_date')}): {act.get('participants_count', 0)} participants. Resource: {act.get('resource_person', 'N/A')}"
        for act in activities
    ])
    
    user_prompt = f"Academic Year: {year}\nTotal Activities Completed: {len(activities)}\n\nActivity Log:\n{activities_summary}"

    full_prompt = system_prompt + "\n\n" + user_prompt
    ai_text = call_gemini_api(full_prompt)
    if ai_text:
        return ai_text

    # Fallback annual report narrative
    return f"""# ANNUAL DEPARTMENTAL ACTIVITY REPORT ({year})
**School of Computer Applications — Union Christian College, Aluva (Autonomous)**

### 1. Executive Overview
During the academic year **{year}**, the School of Computer Applications maintained an exemplary track record of academic rigor, technical empowerment, and holistic student development. A total of **{len(activities)} key departmental activities** were conducted successfully.

### 2. Academic & Co-Curricular Highlights
The department conducted workshops, guest lectures, FDPs, and technical competitions aimed at bridging the gap between academia and modern software industry expectations.

### 3. Activity Summaries
{activities_summary}

### 4. Continuous Improvement & Future Objectives
The department remains committed to fostering innovation, enhancing industry collaboration, and promoting student excellence for upcoming academic sessions."""

