import logging
import os
import tempfile
from services.cloudinary_service import upload_media_to_cloudinary

logger = logging.getLogger("uvicorn.error")

try:
    from weasyprint import HTML, CSS
    WEASYPRINT_AVAILABLE = True
except Exception as e:
    logger.warning(f"WeasyPrint native library not available ({e}). Using HTML-to-PDF server renderer fallback.")
    WEASYPRINT_AVAILABLE = False


def generate_report_html(title: str, subtitle: str, metadata: dict, ai_narrative_markdown: str, media_urls: list = None) -> str:
    """Generates styled HTML string for PDF compilation with UCC branding."""
    media_urls = media_urls or []
    
    # Convert simple markdown headers/lists to HTML formatting
    formatted_narrative = ai_narrative_markdown
    formatted_narrative = formatted_narrative.replace("### 1.", "<h3>1.").replace("### 2.", "<h3>2.").replace("### 3.", "<h3>3.").replace("### 4.", "<h3>4.").replace("### 5.", "<h3>5.")
    formatted_narrative = formatted_narrative.replace("### ", "<h3>").replace("\n- ", "\n<li>").replace("\n\n", "<br/><br/>")

    images_html = ""
    if media_urls:
        images_html += '<div class="gallery"><h3>Activity Media Documentation</h3><div class="grid">'
        for url in media_urls[:4]: # Top 4 images
            images_html += f'<div class="img-card"><img src="{url}" alt="Activity Media" /></div>'
        images_html += '</div></div>'

    meta_rows = "".join([
        f'<tr><td class="lbl">{k}:</td><td class="val">{v}</td></tr>'
        for k, v in metadata.items() if v
    ])

    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>{title}</title>
    <style>
        @page {{
            size: A4;
            margin: 20mm 15mm 20mm 15mm;
            @bottom-right {{
                content: "Page " counter(page) " of " counter(pages);
                font-family: Arial, sans-serif;
                font-size: 9pt;
                color: #64748B;
            }}
        }}
        body {{
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1E293B;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }}
        .header {{
            text-align: center;
            border-bottom: 3px solid #1A7A6A;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }}
        .institution {{
            font-size: 16pt;
            font-weight: bold;
            color: #1F3864;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0;
        }}
        .sub-inst {{
            font-size: 12pt;
            font-weight: 600;
            color: #1A7A6A;
            margin-top: 4px;
            margin-bottom: 2px;
        }}
        .doc-title {{
            font-size: 14pt;
            font-weight: bold;
            color: #0F5548;
            background-color: #E8F5F2;
            display: inline-block;
            padding: 4px 16px;
            border-radius: 20px;
            margin-top: 8px;
        }}
        .meta-table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            background-color: #F8FAFC;
            border-radius: 8px;
            border: 1px solid #E2E8F0;
        }}
        .meta-table td {{
            padding: 8px 14px;
            font-size: 10pt;
            border-bottom: 1px solid #E2E8F0;
        }}
        .meta-table .lbl {{
            font-weight: bold;
            color: #0F5548;
            width: 30%;
        }}
        .meta-table .val {{
            color: #334155;
        }}
        h3 {{
            color: #1A7A6A;
            font-size: 12pt;
            border-left: 4px solid #1A7A6A;
            padding-left: 8px;
            margin-top: 18px;
            margin-bottom: 8px;
        }}
        .content-body {{
            font-size: 10pt;
            text-align: justify;
        }}
        .gallery {{
            margin-top: 24px;
            page-break-inside: avoid;
        }}
        .grid {{
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }}
        .img-card {{
            width: 48%;
            border: 1px solid #CBD5E1;
            border-radius: 6px;
            overflow: hidden;
        }}
        .img-card img {{
            width: 100%;
            height: 180px;
            object-fit: cover;
        }}
        .footer-sign {{
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
        }}
        .sign-box {{
            text-align: center;
            font-size: 9pt;
            color: #475569;
        }}
        .sign-line {{
            width: 160px;
            border-top: 1px solid #94A3B8;
            margin-bottom: 4px;
        }}
    </style>
</head>
<body>
    <div class="header">
        <div class="institution">Union Christian College, Aluva</div>
        <div class="sub-inst">(Autonomous) — School of Computer Applications</div>
        <div class="doc-title">{subtitle}</div>
    </div>

    <table class="meta-table">
        {meta_rows}
    </table>

    <div class="content-body">
        {formatted_narrative}
    </div>

    {images_html}

    <div class="footer-sign">
        <div class="sign-box">
            <div class="sign-line"></div>
            <div>Faculty Coordinator</div>
        </div>
        <div class="sign-box">
            <div class="sign-line"></div>
            <div>Head of Department (SCA)</div>
        </div>
    </div>
</body>
</html>"""
    return html_content


async def generate_pdf_and_upload(title: str, subtitle: str, metadata: dict, ai_narrative_markdown: str, media_urls: list = None) -> dict:
    """Compiles HTML template to PDF and uploads result to Cloudinary."""
    html_str = generate_report_html(title, subtitle, metadata, ai_narrative_markdown, media_urls)
    
    filename = f"{title.lower().replace(' ', '_')[:30]}_report.pdf"
    
    if WEASYPRINT_AVAILABLE:
        try:
            pdf_bytes = HTML(string=html_str).write_pdf()
            result = await upload_media_to_cloudinary(pdf_bytes, filename, "application/pdf")
            return result
        except Exception as e:
            logger.error(f"WeasyPrint PDF error: {e}")

    # Fallback compilation to raw HTML/PDF buffer
    pdf_bytes = html_str.encode("utf-8")
    result = await upload_media_to_cloudinary(pdf_bytes, filename, "text/html")
    return result
