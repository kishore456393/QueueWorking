import streamlit as st
import json
import time
import os
import sys
import tempfile
import threading
from PIL import Image
from pathlib import Path
from streamlit_autorefresh import st_autorefresh
import plotly.graph_objects as go
import plotly.express as px

# Try to import audio system
try:
    import edge_tts
    AUDIO_AVAILABLE = True
except ImportError:
    AUDIO_AVAILABLE = False

try:
    import pygame
    pygame.mixer.init()
    PYGAME_AVAILABLE = True
except:
    PYGAME_AVAILABLE = False

# Page config
st.set_page_config(
    page_title='Live Dashboard',
    layout='wide',
    page_icon='📊',
    initial_sidebar_state='expanded'
)

# Custom CSS - Figma-Inspired Theme
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    /* ===== GLOBAL RESET & FONT ===== */
    * {
        font-family: 'Inter', sans-serif;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    /* ===== ROOT VARIABLES (Dark Theme) ===== */
    :root {
        --bg-primary: #111827;      /* Dark Gray-900 */
        --bg-secondary: #1F2937;   /* Dark Gray-800 */
        --surface: #374151;       /* Dark Gray-700 */
        --text-primary: #F9FAFB;   /* Light Gray-50 */
        --text-secondary: #D1D5DB; /* Light Gray-300 */
        --accent-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        --accent-primary: #667eea;
        --border: #4B5563;        /* Dark Gray-600 */
        --success: #10B981;       /* Green-500 */
        --success-light: #1F2937;  /* Gray-800 */
        --error: #F87171;         /* Red-400 */
        --error-light: #1F2937;    /* Gray-800 */
        --radius-xl: 1rem;
        --radius-lg: 0.75rem;
        --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.15);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.15);
        --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ===== MAIN LAYOUT ===== */
    .main {
        background-color: var(--bg-primary) !important;
    }
    
    .block-container {
        padding: 2rem 2.5rem !important;
        max-width: 1440px !important;
    }

    /* ===== SIDEBAR ===== */
    [data-testid="stSidebar"] {
        background: var(--surface) !important;
        border-right: 1px solid var(--border) !important;
        padding: 1.5rem !important;
    }
    
    [data-testid="stSidebar"] .stRadio > div {
        border-radius: var(--radius-lg);
        padding: 0.5rem;
        background-color: var(--bg-secondary);
    }

    [data-testid="stSidebar"] .stRadio [role="radiogroup"] > label {
        background: transparent;
        border-radius: var(--radius-lg);
        padding: 0.75rem 1rem;
        margin: 0.25rem 0;
        transition: var(--transition-smooth);
        font-weight: 500;
        color: var(--text-primary);
    }

    [data-testid="stSidebar"] .stRadio [role="radiogroup"] > label:hover {
        background-color: #fafbff;
    }

    [data-testid="stSidebar"] .stRadio [role="radiogroup"] > label[data-baseweb="radio"] > div:first-child {
        background: var(--accent-gradient) !important;
        border: none !important;
    }

    /* ===== DASHBOARD HEADER ===== */
    .dashboard-header {
        background: var(--surface);
        padding: 2.5rem;
        border-radius: var(--radius-xl);
        text-align: center;
        margin-bottom: 2.5rem;
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--border);
    }
    
    .dashboard-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }
    
    .dashboard-subtitle {
        font-size: 1.1rem;
        color: var(--text-secondary);
        font-weight: 500;
    }
    
    /* ===== METRIC CARDS ===== */
    .metric-card {
        background: linear-gradient(145deg, #4B5563, #374151);
        padding: 2rem;
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-md);
        text-align: center;
        border: 1px solid var(--border);
        transition: var(--transition-smooth);
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 180px; /* Ensure uniform height */
    }
    
    .metric-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
    }
    
    .metric-value {
        font-size: 2.75rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0.5rem 0;
    }
    
    .metric-label {
        font-size: 0.9rem;
        color: var(--text-secondary);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    /* ===== QUEUE CARDS ===== */
    .queue-card {
        background: linear-gradient(135deg, rgba(75, 85, 99, 0.6), rgba(31, 41, 55, 0.6));
        padding: 1.25rem 1.5rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        margin: 0 0 1rem 0 !important;
        border: 1px solid var(--border);
        border-left: 4px solid var(--border);
        transition: var(--transition-smooth);
        display: flex !important;
        flex-direction: column;
        justify-content: space-between;
        width: 100% !important;
        min-height: 150px; /* Set a minimum height for consistency */
    }
    
    .queue-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-left-color: var(--accent-primary);
    }
    
    .best-queue {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(16, 185, 129, 0.08));
        border-color: var(--success);
        border-left: 4px solid var(--success);
    }
    
    .worst-queue {
        background: linear-gradient(135deg, rgba(248, 113, 113, 0.18), rgba(220, 38, 38, 0.08));
        border-color: var(--error);
        border-left: 4px solid var(--error);
    }
    
    .queue-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text-primary) !important;
        margin-bottom: 0.5rem;
    }
    
    /* ===== SECTION TITLES ===== */
    .section-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1.5rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--border);
    }
    
    /* ===== BUTTONS ===== */
    .stButton>button {
        background: var(--accent-gradient) !important;
        color: white !important;
        border-radius: var(--radius-lg) !important;
        font-weight: 600 !important;
        height: 3rem !important;
        box-shadow: var(--shadow-sm);
        transition: var(--transition-smooth) !important;
        border: none;
        font-size: 1rem;
    }
    
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
    
    /* ===== VIDEO & GRAPH CONTAINERS ===== */
    .video-container, .graph-container, .recommendation-box {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-xl);
        padding: 1.5rem;
        box-shadow: var(--shadow-sm);
        margin-bottom: 2rem;
    }

    /* ===== FORCE SIDEBAR VISIBLE ON THIS PAGE ===== */
    [data-testid="stSidebar"] {
        visibility: visible !important;
        transform: translateX(0) !important;
        width: 22rem !important;
        min-width: 22rem !important;
    }

    /* Ensure it stays visible even when 'collapsed' */
    [data-testid="stSidebar"][aria-expanded="false"] {
        transform: translateX(0) !important;
    }

    /* Hide the collapse/expand control to prevent accidental hiding */
    [data-testid="collapsedControl"],
    [data-testid="stSidebarCollapsedControl"] {
        display: none !important;
    }

    /* ===== HIDE STREAMLIT BRANDING ===== */
    # MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
</style>
""", unsafe_allow_html=True)

# Floating Sidebar Toggle (helps when header toggle is hidden)
import streamlit.components.v1 as components
components.html(
        """
        <script>
        (function(){
            try {
                const d = window.parent.document;
                if (d.querySelector('.qs-toggle-btn')) return;
                const wrap = d.createElement('div');
                wrap.className = 'qs-toggle-btn';
                wrap.style.position = 'fixed';
                wrap.style.top = '16px';
                wrap.style.left = '16px';
                wrap.style.zIndex = '10000';
                const btn = d.createElement('button');
                btn.title = 'Open sidebar';
                btn.textContent = '☰';
                btn.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)';
                btn.style.color = '#fff';
                btn.style.border = '0';
                btn.style.borderRadius = '999px';
                btn.style.padding = '8px 12px';
                btn.style.fontWeight = '700';
                btn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
                btn.style.cursor = 'pointer';
                btn.onclick = function(){
                    const sels = [
                        "[data-testid='collapsedControl']",
                        "button[title='Expand sidebar']",
                        "button[title='Collapse sidebar']",
                        "button[aria-label*='sidebar' i]"
                    ];
                    let clicked = false;
                    for (const s of sels) { const el = d.querySelector(s); if (el) { el.click(); clicked = true; break; } }
                    if (!clicked) {
                        let style = d.getElementById('qs-force-sidebar-style');
                        if (!style) {
                            style = d.createElement('style');
                            style.id = 'qs-force-sidebar-style';
                            style.textContent = `
                              [data-testid="stSidebar"] { transform: none !important; visibility: visible !important; }
                              .main .block-container { margin-left: 21rem !important; }
                            `;
                            d.head.appendChild(style);
                        }
                        const sb = d.querySelector('[data-testid="stSidebar"]');
                        if (sb) sb.setAttribute('aria-expanded', 'true');
                    }
                };
                wrap.appendChild(btn);
                d.body.appendChild(wrap);
            } catch(e) { /* ignore */ }
        })();
        </script>
        """,
        height=0,
)

# Initialize session state
if 'audio_enabled' not in st.session_state:
    st.session_state.audio_enabled = False
if 'selected_language' not in st.session_state:
    st.session_state.selected_language = 'en'
if 'last_announcement_time' not in st.session_state:
    st.session_state.last_announcement_time = 0
if 'audio_interval' not in st.session_state:
    st.session_state.audio_interval = 30
if 'last_refresh_time' not in st.session_state:
    st.session_state.last_refresh_time = 0

# Language options
LANGUAGES = {
    'en': '🇬🇧 English',
    'hi': '🇮🇳 Hindi (हिन्दी)',
    'ta': '🇮🇳 Tamil (தமிழ்)',
    'te': '🇮🇳 Telugu (తెలుగు)',
    'bn': '🇮🇳 Bengali (বাংলা)',
    'mr': '🇮🇳 Marathi (मराठी)',
    'gu': '🇮🇳 Gujarati (ગુજરાતી)',
    'kn': '🇮🇳 Kannada (ಕನ್ನಡ)',
    'ml': '🇮🇳 Malayalam (മലയാളം)',
    'pa': '🇮🇳 Punjabi (ਪੰਜਾਬੀ)',
    'ur': '🇮🇳 Urdu (اردو)',
    'or': '🇮🇳 Odia (ଓଡ଼ିଆ)',
    'as': '🇮🇳 Assamese (অসমীয়া)',
    'sa': '🇮🇳 Sanskrit (संस्कृतम्)'
}

# Audio templates
AUDIO_TEMPLATES = {
    "en": "Queue number {queue_num} is fastest with {people} people waiting. Wait time {minutes} minutes.",
    "hi": "क्यू नंबर {queue_num} सबसे तेज़ है, {people} लोग इंतज़ार कर रहे हैं। प्रतीक्षा समय {minutes} मिनट।",
    "ta": "வரிசை எண் {queue_num} வேகமானது, {people} பேர் காத்திருக்கின்றனர். காத்திருப்பு நேரம் {minutes} நிமிடங்கள்.",
    "te": "క్యూ నంబర్ {queue_num} వేగంగా ఉంది, {people} మంది వేచి ఉన్నారు। వేచి ఉండే సమయం {minutes} నిమిషాలు.",
    "bn": "সারি নম্বর {queue_num} সবচেয়ে দ্রুত, {people} জন অপেক্ষা করছে। অপেক্ষার সময় {minutes} মিনিট।",
    "mr": "रांग क्रमांक {queue_num} सर्वात वेगवान आहे, {people} लोक वाट पाहत आहेत। प्रतीक्षा वेळ {minutes} मिनिटे।",
    "gu": "કતાર નંબર {queue_num} સૌથી ઝડપી છે, {people} લોકો રાહ જોઈ રહ્યા છે। રાહ જોવાનો સમય {minutes} મિનિટ।",
    "kn": "ಸರತಿ ಸಂಖ್ಯೆ {queue_num} ವೇಗವಾಗಿದೆ, {people} ಜನರು ಕಾಯುತ್ತಿದ್ದಾರೆ। ಕಾಯುವ ಸಮಯ {minutes} ನಿಮಿಷಗಳು.",
    "ml": "ക്യൂ നമ്പർ {queue_num} വേഗതയേറിയതാണ്, {people} പേർ കാത്തിരിക്കുന്നു. കാത്തിരിപ്പ് സമയം {minutes} മിനിറ്റ്.",
    "pa": "ਕਤਾਰ ਨੰਬਰ {queue_num} ਸਭ ਤੋਂ ਤੇਜ਼ ਹੈ, {people} ਲੋਕ ਇਨਤਜ਼ਾਰ ਕਰ ਰਹੇ ਹਨ। ਉਡੀਕ ਦਾ ਸਮਾਂ {minutes} ਮਿੰਟ।",
    "ur": "قطار نمبر {queue_num} سب سے تیز ہے، {people} لوگ انتظار کر رہے ہیں۔ انتظار کا وقت {minutes} منٹ۔",
    "or": "ଧାଡ଼ି ନମ୍ବର {queue_num} ଦ୍ରୁତତମ, {people} ଜଣ ଅପେକ୍ଷା କରୁଛନ୍ତି। ଅପେକ୍ଷା ସମୟ {minutes} ମିନିଟ୍।",
    "as": "শাৰী নম্বৰ {queue_num} আটাইতকৈ দ্ৰুত, {people} জনে অপেক্ষা কৰিছে। অপেক্ষাৰ সময় {minutes} মিনিট।",
    "sa": "पंक्ति संख्या {queue_num} द्रुततम अस्ति, {people} जना: प्रतीक्षा कुर्वन्ति। प्रतीक्षा काल: {minutes} निमेषा:।"
}

# Edge-TTS voice mapping
EDGE_VOICES = {
    'en': 'en-US-GuyNeural',
    'hi': 'hi-IN-SwaraNeural',
    'ta': 'ta-IN-PallaviNeural',
    'te': 'te-IN-ShrutiNeural',
    'bn': 'bn-IN-TanishaaNeural',
    'mr': 'mr-IN-AarohiNeural',
    'gu': 'gu-IN-DhwaniNeural',
    'kn': 'kn-IN-SapnaNeural',
    'ml': 'ml-IN-SobhanaNeural',
    'pa': 'pa-IN-VaaniNeural',
    'ur': 'ur-IN-GulNeural',
    'or': 'or-IN-SubhasiniNeural',
    'as': 'as-IN-YashicaNeural',
    'sa': 'hi-IN-SwaraNeural'
}

# UI Translations
UI_TRANSLATIONS = {
    'en': {
        'title': 'Live Queue Dashboard',
        'subtitle': 'Real-time AI-powered queue analytics',
        'total_people': 'Total People',
        'active_queues': 'Active Queues',
        'best_queue': 'Best Queue',
        'avoid_queue': 'Avoid Queue',
        'live_view': 'Live Detection View',
        'recommendation': 'Smart Recommendation',
        'queue_details': 'Queue Details',
        'people': 'People',
        'wait_time': 'Est. Wait',
        'minutes': 'min',
        'best_choice': 'Best Choice',
        'avoid': 'Avoid',
        'normal': 'Normal',
        'queue': 'Queue'
    },
    'hi': {
        'title': 'लाइव पंक्ति डैशबोर्ड',
        'subtitle': 'वास्तविक समय में AI संचालित पंक्ति विश्लेषण',
        'total_people': 'कुल लोग',
        'active_queues': 'सक्रिय पंक्तियाँ',
        'best_queue': 'सर्वोत्तम पंक्ति',
        'avoid_queue': 'बचने योग्य पंक्ति',
        'live_view': 'लाइव दृश्य',
        'recommendation': 'स्मार्ट सुझाव',
        'queue_details': 'पंक्ति विवरण',
        'people': 'लोग',
        'wait_time': 'अनुमानित प्रतीक्षा',
        'minutes': 'मिनट',
        'best_choice': 'सर्वोत्तम विकल्प',
        'avoid': 'बचें',
        'normal': 'सामान्य',
        'queue': 'पंक्ति'
    },
    'ta': {
        'title': 'நேரடி வரிசை டாஷ்போர்டு',
        'subtitle': 'நிகழ்நேர AI இயங்கும் வரிசை பகுப்பாய்வு',
        'total_people': 'மொத்த மக்கள்',
        'active_queues': 'செயலில் உள்ள வரிசைகள்',
        'best_queue': 'சிறந்த வரிசை',
        'avoid_queue': 'தவிர்க்க வேண்டிய வரிசை',
        'live_view': 'நேரடி காட்சி',
        'recommendation': 'புத்திசாலி பரிந்துரை',
        'queue_details': 'வரிசை விவரங்கள்',
        'people': 'மக்கள்',
        'wait_time': 'மதிப்பிடப்பட்ட காத்திருப்பு',
        'minutes': 'நிமிடங்கள்',
        'best_choice': 'சிறந்த தேர்வு',
        'avoid': 'தவிர்க்கவும்',
        'normal': 'சாதாரணம்',
        'queue': 'வரிசை'
    },
    'te': {
        'title': 'ప్రత్యక్ష క్యూ డాష్‌బోర్డ్',
        'subtitle': 'నిజ-సమయ AI నడిచే క్యూ విశ్లేషణ',
        'total_people': 'మొత్తం ప్రజలు',
        'active_queues': 'క్రియాశీల క్యూలు',
        'best_queue': 'ఉత్తమ క్యూ',
        'avoid_queue': 'తప్పించుకోవాల్సిన క్యూ',
        'live_view': 'ప్రత్యక్ష వీక్షణ',
        'recommendation': 'స్మార్ట్ సిఫార్సు',
        'queue_details': 'క్యూ వివరాలు',
        'people': 'ప్రజలు',
        'wait_time': 'అంచనా నిరీక్షణ',
        'minutes': 'నిమిషాలు',
        'best_choice': 'ఉత్తమ ఎంపిక',
        'avoid': 'తప్పించుకోండి',
        'normal': 'సాధారణ',
        'queue': 'క్యూ'
    },
    'bn': {
        'title': 'লাইভ সারি ড্যাশবোর্ড',
        'subtitle': 'রিয়েল-টাইম AI চালিত সারি বিশ্লেষণ',
        'total_people': 'মোট মানুষ',
        'active_queues': 'সক্রিয় সারি',
        'best_queue': 'সেরা সারি',
        'avoid_queue': 'এড়ানো সারি',
        'live_view': 'লাইভ দৃশ্য',
        'recommendation': 'স্মার্ট সুপারিশ',
        'queue_details': 'সারির বিবরণ',
        'people': 'মানুষ',
        'wait_time': 'আনুমানিক অপেক্ষা',
        'minutes': 'মিনিট',
        'best_choice': 'সেরা পছন্দ',
        'avoid': 'এড়িয়ে চলুন',
        'normal': 'স্বাভাবিক',
        'queue': 'সারি'
    },
    'mr': {
        'title': 'थेट रांग डॅशबोर्ड',
        'subtitle': 'रिअल-टाइम AI चालित रांग विश्लेषण',
        'total_people': 'एकूण लोक',
        'active_queues': 'सक्रिय रांगा',
        'best_queue': 'सर्वोत्तम रांग',
        'avoid_queue': 'टाळण्यायोग्य रांग',
        'live_view': 'थेट दृश्य',
        'recommendation': 'स्मार्ट शिफारस',
        'queue_details': 'रांग तपशील',
        'people': 'लोक',
        'wait_time': 'अंदाजे प्रतीक्षा',
        'minutes': 'मिनिटे',
        'best_choice': 'सर्वोत्तम निवड',
        'avoid': 'टाळा',
        'normal': 'सामान्य',
        'queue': 'रांग'
    },
    'gu': {
        'title': 'લાઇવ કતાર ડેશબોર્ડ',
        'subtitle': 'રિયલ-ટાઇમ AI સંચાલિત કતાર વિશ્લેષણ',
        'total_people': 'કુલ લોકો',
        'active_queues': 'સક્રિય કતારો',
        'best_queue': 'શ્રેષ્ઠ કતાર',
        'avoid_queue': 'ટાળવા જેવી કતાર',
        'live_view': 'લાઇવ દૃશ્ય',
        'recommendation': 'સ્માર્ટ ભલામણ',
        'queue_details': 'કતાર વિગતો',
        'people': 'લોકો',
        'wait_time': 'અંદાજિત રાહ',
        'minutes': 'મિનિટ',
        'best_choice': 'શ્રેષ્ઠ પસંદગી',
        'avoid': 'ટાળો',
        'normal': 'સામાન્ય',
        'queue': 'કતાર'
    },
    'kn': {
        'title': 'ಲೈವ್ ಸರತಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
        'subtitle': 'ನೈಜ-ಸಮಯ AI ಚಾಲಿತ ಸರತಿ ವಿಶ್ಲೇಷಣೆ',
        'total_people': 'ಒಟ್ಟು ಜನರು',
        'active_queues': 'ಸಕ್ರಿಯ ಸರತಿಗಳು',
        'best_queue': 'ಉತ್ತಮ ಸರತಿ',
        'avoid_queue': 'ತಪ್ಪಿಸಬೇಕಾದ ಸರತಿ',
        'live_view': 'ಲೈವ್ ವೀಕ್ಷಣೆ',
        'recommendation': 'ಸ್ಮಾರ್ಟ್ ಶಿಫಾರಸು',
        'queue_details': 'ಸರತಿ ವಿವರಗಳು',
        'people': 'ಜನರು',
        'wait_time': 'ಅಂದಾಜು ನಿರೀಕ್ಷೆ',
        'minutes': 'ನಿಮಿಷಗಳು',
        'best_choice': 'ಉತ್ತಮ ಆಯ್ಕೆ',
        'avoid': 'ತಪ್ಪಿಸಿ',
        'normal': 'ಸಾಮಾನ್ಯ',
        'queue': 'ಸರತಿ'
    },
    'ml': {
        'title': 'ലൈവ് ക്യൂ ഡാഷ്‌ബോർഡ്',
        'subtitle': 'തത്സമയ AI പ്രവർത്തിക്കുന്ന ക്യൂ വിശകലനം',
        'total_people': 'ആകെ ആളുകൾ',
        'active_queues': 'സജീവ ക്യൂകൾ',
        'best_queue': 'മികച്ച ക്യൂ',
        'avoid_queue': 'ഒഴിവാക്കേണ്ട ക്യൂ',
        'live_view': 'തത്സമയ കാഴ്ച',
        'recommendation': 'സ്മാർട്ട് ശുപാർശ',
        'queue_details': 'ക്യൂ വിശദാംശങ്ങൾ',
        'people': 'ആളുകൾ',
        'wait_time': 'കണക്കാക്കിയ കാത്തിരിപ്പ്',
        'minutes': 'മിനിറ്റ്',
        'best_choice': 'മികച്ച തിരഞ്ഞെടുപ്പ്',
        'avoid': 'ഒഴിവാക്കുക',
        'normal': 'സാധാരണ',
        'queue': 'ക്യൂ'
    },
    'pa': {
        'title': 'ਲਾਈਵ ਕਤਾਰ ਡੈਸ਼ਬੋਰਡ',
        'subtitle': 'ਰੀਅਲ-ਟਾਈਮ AI ਸੰਚਾਲਿਤ ਕਤਾਰ ਵਿਸ਼ਲੇਸ਼ਣ',
        'total_people': 'ਕੁੱਲ ਲੋਕ',
        'active_queues': 'ਸਰਗਰਮ ਕਤਾਰਾਂ',
        'best_queue': 'ਸਭ ਤੋਂ ਵਧੀਆ ਕਤਾਰ',
        'avoid_queue': 'ਬਚਣ ਵਾਲੀ ਕਤਾਰ',
        'live_view': 'ਲਾਈਵ ਦ੍ਰਿਸ਼',
        'recommendation': 'ਸਮਾਰਟ ਸਿਫਾਰਸ਼',
        'queue_details': 'ਕਤਾਰ ਵੇਰਵੇ',
        'people': 'ਲੋਕ',
        'wait_time': 'ਅਨੁਮਾਨਿਤ ਉਡੀਕ',
        'minutes': 'ਮਿੰਟ',
        'best_choice': 'ਸਭ ਤੋਂ ਵਧੀਆ ਚੋਣ',
        'avoid': 'ਬਚੋ',
        'normal': 'ਆਮ',
        'queue': 'ਕਤਾਰ'
    },
    'ur': {
        'title': 'لائیو قطار ڈیش بورڈ',
        'subtitle': 'حقیقی وقت AI سے چلنے والا قطار تجزیہ',
        'total_people': 'کل لوگ',
        'active_queues': 'فعال قطاریں',
        'best_queue': 'بہترین قطار',
        'avoid_queue': 'بچنے والی قطار',
        'live_view': 'براہ راست منظر',
        'recommendation': 'سمارٹ تجویز',
        'queue_details': 'قطار کی تفصیلات',
        'people': 'لوگ',
        'wait_time': 'تخمینی انتظار',
        'minutes': 'منٹ',
        'best_choice': 'بہترین انتخاب',
        'avoid': 'بچیں',
        'normal': 'عام',
        'queue': 'قطار'
    },
    'or': {
        'title': 'ଲାଇଭ୍ ଧାଡ଼ି ଡ୍ୟାସବୋର୍ଡ',
        'subtitle': 'ରିଅଲ୍-ଟାଇମ୍ AI ଚାଳିତ ଧାଡ଼ି ବିଶ୍ଳେଷଣ',
        'total_people': 'ମୋଟ ଲୋକ',
        'active_queues': 'ସକ୍ରିୟ ଧାଡ଼ିଗୁଡ଼ିକ',
        'best_queue': 'ସର୍ବୋତ୍ତମ ଧାଡ଼ି',
        'avoid_queue': 'ଏଡ଼ାଇବାକୁ ଧାଡ଼ି',
        'live_view': 'ଲାଇଭ୍ ଦୃଶ୍ୟ',
        'recommendation': 'ସ୍ମାର୍ଟ ସୁପାରିଶ',
        'queue_details': 'ଧାଡ଼ି ବିବରଣୀ',
        'people': 'ଲୋକ',
        'wait_time': 'ଆନୁମାନିକ ଅପେକ୍ଷା',
        'minutes': 'ମିନିଟ୍',
        'best_choice': 'ସର୍ବୋତ୍ତମ ପସନ୍ଦ',
        'avoid': 'ଏଡ଼ାନ୍ତୁ',
        'normal': 'ସାଧାରଣ',
        'queue': 'ଧାଡ଼ି'
    },
    'as': {
        'title': 'লাইভ শাৰী ডেশবৰ্ড',
        'subtitle': 'ৰিয়েল-টাইম AI চালিত শাৰী বিশ্লেষণ',
        'total_people': 'মুঠ লোক',
        'active_queues': 'সক্ৰিয় শাৰী',
        'best_queue': 'শ্ৰেষ্ঠ শাৰী',
        'avoid_queue': 'পৰিহাৰ কৰিবলগীয়া শাৰী',
        'live_view': 'লাইভ দৃশ্য',
        'recommendation': 'স্মাৰ্ট পৰামৰ্শ',
        'queue_details': 'শাৰীৰ বিৱৰণ',
        'people': 'লোক',
        'wait_time': 'আনুমানিক অপেক্ষা',
        'minutes': 'মিনিট',
        'best_choice': 'শ্ৰেষ্ঠ পছন্দ',
        'avoid': 'পৰিহাৰ কৰক',
        'normal': 'সাধাৰণ',
        'queue': 'শাৰী'
    },
    'sa': {
        'title': 'सजीव पंक्ति डैशबोर्ड',
        'subtitle': 'वास्तविक समय AI संचालित पंक्ति विश्लेषणम्',
        'total_people': 'कुल जनाः',
        'active_queues': 'सक्रिय पंक्तयः',
        'best_queue': 'उत्तम पंक्तिः',
        'avoid_queue': 'वर्जनीय पंक्तिः',
        'live_view': 'सजीव दृश्यम्',
        'recommendation': 'सुचतुर सिफारिस',
        'queue_details': 'पंक्ति विवरणानि',
        'people': 'जनाः',
        'wait_time': 'अनुमानित प्रतीक्षा',
        'minutes': 'निमेषाः',
        'best_choice': 'उत्तम विकल्पः',
        'avoid': 'वर्जयन्तु',
        'normal': 'सामान्यः',
        'queue': 'पंक्तिः'
    }
}

# Add English as fallback for other languages
for lang_code in LANGUAGES.keys():
    if lang_code not in UI_TRANSLATIONS:
        UI_TRANSLATIONS[lang_code] = UI_TRANSLATIONS['en']

# Sidebar
with st.sidebar:
    st.markdown("## 📊 Dashboard Settings")
    st.markdown("###")
    
    # Language selection
    st.markdown("### 🌐 Language")
    selected_lang = st.selectbox(
        "Select Language",
        options=list(LANGUAGES.keys()),
        format_func=lambda x: LANGUAGES[x],
        index=list(LANGUAGES.keys()).index(st.session_state.selected_language),
        key="lang_select"
    )
    if selected_lang != st.session_state.selected_language:
        st.session_state.selected_language = selected_lang
        st.rerun()
    
    # Audio toggle
    st.markdown("### 🔊 Audio Announcements")
    if AUDIO_AVAILABLE and PYGAME_AVAILABLE:
        audio_enabled = st.checkbox("Enable Audio", value=st.session_state.audio_enabled, 
                                   help="Announce best queue periodically")
        st.session_state.audio_enabled = audio_enabled
        
        if audio_enabled:
            # Audio interval slider
            audio_interval = st.slider("Announcement Interval (seconds)", 
                                      min_value=10, max_value=120, 
                                      value=st.session_state.audio_interval, 
                                      step=5,
                                      help="How often to announce the best queue",
                                      key="audio_interval_slider")
            
            # Update if changed
            if audio_interval != st.session_state.audio_interval:
                st.session_state.audio_interval = audio_interval
            
            st.info(f"🗣️ Speaking in: {LANGUAGES[st.session_state.selected_language]}")
            
            # Show time until next announcement
            current_time = time.time()
            time_since_last = current_time - st.session_state.last_announcement_time
            time_until_next = max(0, st.session_state.audio_interval - time_since_last)
            
            if st.session_state.last_announcement_time == 0:
                st.success("⏱️ **Ready for first announcement**")
            elif time_until_next <= 1:
                st.success("🔊 **Announcing...**")
            else:
                st.caption(f"⏱️ Next announcement in: **{int(time_until_next)}** seconds")
            
            # Debug info
            with st.expander("🔧 Debug Info"):
                st.caption(f"Last announced: {time_since_last:.1f}s ago")
                st.caption(f"Interval: {st.session_state.audio_interval}s")
                st.caption(f"Should announce: {time_since_last >= st.session_state.audio_interval}")
    else:
        st.warning("⚠️ Audio not available. Install: `pip install edge-tts pygame`")
    
    st.markdown("---")
    
    # Auto-refresh toggle
    st.markdown("### 🔄 Refresh Settings")
    st.markdown("")
    auto_refresh = st.toggle("🔄 Auto Refresh", value=True, help="Automatically update dashboard")
    
    if auto_refresh:
        refresh_rate = st.slider("Update Interval", 
                                min_value=1, max_value=10, value=2,
                                help="Seconds between updates",
                                key="refresh_interval_slider")
        
        # Use st_autorefresh with the selected interval
        count = st_autorefresh(interval=refresh_rate * 1000, key="datarefresh")
        
        st.markdown(f"""
        <div style='background: rgba(255,255,255,0.1); padding: 0.8rem; border-radius: 8px; font-size: 0.85rem;'>
            ⚡ Every {refresh_rate}s<br>
            📊 Refreshes: {count}
        </div>
        """, unsafe_allow_html=True)
    else:
        count = 0
        st.caption("⏸️ Manual mode")
    
    st.markdown("---")
    
    # View options
    st.markdown("### 👁️ Display Options")
    show_video = st.checkbox("📹 Live Video", value=True)
    show_metrics = st.checkbox("📊 Metrics Cards", value=True)
    show_chart = st.checkbox("📈 Analytics Chart", value=True)
    
    st.markdown("---")
    
    # Quick Navigation
    st.markdown("### 🧭 Quick Navigation")
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🏠", use_container_width=True, help="Home"):
            st.switch_page("app.py")
    with col2:
        if st.button("⚙️", use_container_width=True, help="Setup"):
            st.switch_page("pages/2_🎥_Video_Upload.py")
    
    if st.button("🔄 Refresh Now", type="primary", use_container_width=True):
        st.rerun()
    
    st.markdown("---")
    st.markdown("### ℹ️ Status")
    
    data_dir = Path(__file__).parent.parent.parent / 'data'
    json_path = data_dir / 'queues.json'
    
    if json_path.exists():
        st.success("🟢 System Active")
    else:
        st.error("🔴 No Data")

# Get current language translations
lang = st.session_state.selected_language
ui_text = UI_TRANSLATIONS.get(lang, UI_TRANSLATIONS['en'])

# Dashboard Header
st.markdown(f"""
<div class="dashboard-header">
    <div class="dashboard-title">📊 {ui_text["title"]}</div>
    <div class="dashboard-subtitle">{ui_text["subtitle"]}</div>
</div>
""", unsafe_allow_html=True)

# Data paths
data_dir = Path(__file__).parent.parent.parent / 'data'
frame_path = data_dir / 'live_frame.jpg'
json_path = data_dir / 'queues.json'

# Show refresh indicator
if auto_refresh and 'count' in locals():
    st.markdown(f"""
    <div style='position: fixed; top: 70px; right: 20px; z-index: 999; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 8px 16px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                color: white; font-size: 12px; font-weight: 600;'>
        🔄 Live • Update #{count} • Every {refresh_rate}s
    </div>
    """, unsafe_allow_html=True)

# Check if data exists
if not json_path.exists():
    st.warning("⚠️ No detection data available")
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.info("""
        ### 🚀 Get Started
        
        No queue data detected. To start:
        
        1. Go to **Setup & Process** page
        2. Upload a video
        3. Draw queue zones
        4. Start detection
        
        Then return here to see live analytics!
        """)
        
        if st.button("➡️ Go to Setup", type='primary', use_container_width=True):
            st.switch_page("pages/2_🎥_Video_Upload.py")
    st.stop()

# Load data fresh on each refresh
try:
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    # Get file modification time to show data freshness
    data_mod_time = os.path.getmtime(json_path)
    data_age = time.time() - data_mod_time
    
    if data_age < 5:
        freshness_color = "#10b981"  # Green
        freshness_text = "🟢 Fresh"
    elif data_age < 30:
        freshness_color = "#f59e0b"  # Orange
        freshness_text = "🟡 Recent"
    else:
        freshness_color = "#ef4444"  # Red
        freshness_text = "🔴 Stale"
    
    st.markdown(f"""
    <div style='text-align: right; color: {freshness_color}; font-size: 13px; 
                font-weight: 600; margin-bottom: 10px;'>
        {freshness_text} • Data age: {data_age:.1f}s
    </div>
    """, unsafe_allow_html=True)
    
except Exception as e:
    st.error(f"Error loading data: {e}")
    st.stop()

# Audio announcement function
def make_announcement_sync(queue_num, people_count, wait_minutes, language):
    """Generate and play audio announcement synchronously"""
    try:
        import asyncio
        
        template = AUDIO_TEMPLATES.get(language, AUDIO_TEMPLATES['en'])
        text = template.format(queue_num=queue_num, people=people_count, minutes=wait_minutes)
        voice = EDGE_VOICES.get(language, EDGE_VOICES['en'])
        
        # Generate audio file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp_file:
            tmp_path = tmp_file.name
        
        # Run edge-tts in sync mode
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        async def generate_audio():
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(tmp_path)
        
        loop.run_until_complete(generate_audio())
        loop.close()
        
        # Play audio
        if PYGAME_AVAILABLE and os.path.exists(tmp_path):
            pygame.mixer.music.load(tmp_path)
            pygame.mixer.music.play()
            
            # Wait for audio to finish
            while pygame.mixer.music.get_busy():
                time.sleep(0.1)
        
        # Cleanup
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        
        return True
    except Exception as e:
        print(f"Audio error: {e}")
        return False

def play_announcement_thread(queue_num, people_count, wait_minutes, language):
    """Thread wrapper for audio announcement"""
    try:
        make_announcement_sync(queue_num, people_count, wait_minutes, language)
    except Exception as e:
        print(f"Thread error: {e}")

# Make audio announcement if enabled
if st.session_state.audio_enabled and AUDIO_AVAILABLE and PYGAME_AVAILABLE:
    current_time = time.time()
    announcement_interval = st.session_state.audio_interval
    time_since_last = current_time - st.session_state.last_announcement_time
    
    # Simple check: has enough time passed?
    if time_since_last >= announcement_interval:
        best_queue = data.get('best_queue', 1)
        queue_counts = data.get('queue_counts', [])
        
        if queue_counts and best_queue <= len(queue_counts):
            people = queue_counts[best_queue - 1]
            wait_time = people * 2
            
            # Update timestamp BEFORE starting thread to prevent multiple triggers
            st.session_state.last_announcement_time = current_time
            
            # Start announcement in separate thread (non-blocking)
            announcement_thread = threading.Thread(
                target=play_announcement_thread,
                args=(best_queue, people, wait_time, st.session_state.selected_language),
                daemon=True
            )
            announcement_thread.start()

# Main metrics at top
if show_metrics:
    st.markdown('<div class="section-header"><h2 class="section-title">📊 Real-Time Metrics</h2></div>', unsafe_allow_html=True)
    
    col1, col2, col3, col4 = st.columns(4, gap="large")
    
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">👥 {ui_text['total_people']}</div>
            <div class="metric-value">{data.get('total_people', 0)}</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">🎯 {ui_text['active_queues']}</div>
            <div class="metric-value">{data.get('total_queues', 0)}</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        best_q = data.get('best_queue', 1)
        st.markdown(f"""
        <div class="metric-card" style="border-top: 4px solid #10b981;">
            <div class="metric-label">✅ {ui_text['best_queue']}</div>
            <div class="metric-value" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">#{best_q}</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        worst_q = data.get('worst_queue', 1)
        st.markdown(f"""
        <div class="metric-card" style="border-top: 4px solid #ef4444;">
            <div class="metric-label">⚠️ {ui_text['avoid_queue']}</div>
            <div class="metric-value" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">#{worst_q}</div>
        </div>
        """, unsafe_allow_html=True)

st.markdown("###")

# Main content area
col1, col2 = st.columns([3, 2])

with col1:
    if show_video:
        st.markdown('<div class="section-header"><h2 class="section-title">📹 Live Video Feed</h2></div>', unsafe_allow_html=True)
        if frame_path.exists():
            st.markdown('<div class="video-container">', unsafe_allow_html=True)
            # Display image directly from path to avoid truncation issues
            try:
                st.image(str(frame_path), use_container_width=True)
            except Exception as e:
                st.warning(f"📷 Video frame loading... ({str(e)[:50]})")
            
            # Add timestamp below video with Figma styling
            timestamp = data.get('timestamp', '')
            if timestamp:
                try:
                    time_str = timestamp.split('T')[1].split('.')[0]
                    date_str = timestamp.split('T')[0]
                    st.markdown(f"""
                    <div style='text-align: center; padding: 12px; margin-top: 12px;
                                background: var(--accent-light); border-radius: var(--radius-md);
                                border: 1px solid var(--accent-primary);'>
                        <span style='color: var(--accent-primary); font-size: 14px; font-weight: 600;'>
                            🕒 {time_str} &nbsp;|&nbsp; 📅 {date_str}
                        </span>
                    </div>
                    """, unsafe_allow_html=True)
                except:
                    pass
            
            st.markdown("</div>", unsafe_allow_html=True)
        else:
            st.warning('⚠️ No live frame available')

with col2:
    st.markdown('<div class="section-header"><h2 class="section-title">🎯 Smart Recommendations</h2></div>', unsafe_allow_html=True)
    
    queue_counts = data.get('queue_counts', [])
    best_q = data.get('best_queue', 1)
    
    # Recommendation box
    recommendation = data.get('recommendation', 'Processing...')
    st.markdown(f"""
    <div style='background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%); 
                backdrop-filter: blur(10px);
                padding: 2rem; border-radius: 16px; 
                box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
                border: 1px solid rgba(16, 185, 129, 0.4);
                margin-bottom: 1.5rem;
                position: relative;
                overflow: hidden;'>
        <div style='position: absolute; top: -50%; right: -50%; width: 200%; height: 200%;
                    background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);'></div>
        <div style='font-size: 1.2rem; font-weight: 700; color: #10b981; margin-bottom: 0.8rem; position: relative; z-index: 1;'>
            ✅ Smart Recommendation
        </div>
        <div style='font-size: 1.1rem; color: #e0f2fe; font-weight: 600; position: relative; z-index: 1;'>
            {recommendation}
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("###")
    
    # Queue details
    st.markdown("""
    <div style='background: rgba(30, 41, 59, 0.5); backdrop-filter: blur(10px);
                padding: 1rem 1.8rem; border-radius: 14px; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                border: 1px solid rgba(99, 102, 241, 0.3);
                margin-bottom: 1rem;'>
        <h3 style='color: #f1f5f9; margin: 0.5rem 0; font-size: 1.4rem; font-weight: 700;'>📋 Queue Analysis</h3>
    </div>
    """, unsafe_allow_html=True)
    
    for i, count in enumerate(queue_counts):
        queue_num = i + 1
        wait_time = count * 2  # Estimate
        
        if queue_num == best_q:
            status = f"✅ {ui_text['best_choice']}"
            card_class = "queue-card best-queue"
        elif count == max(queue_counts):
            status = f"⚠️ {ui_text['avoid']}"
            card_class = "queue-card worst-queue"
        else:
            status = f"⚪ {ui_text['normal']}"
            card_class = "queue-card"
        
        # Each queue card in its own container with clear separation
        st.markdown(f"""
        <div class="{card_class}" style="margin-bottom: 1.5rem; display: block; width: 100%; clear: both;">
            <div class="queue-title" style="clear: both;">
                {ui_text['queue']} {queue_num}
                <span style="float: right; font-size: 1rem; font-weight: 600; color: #cbd5e1;">{status}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; clear: both;">
                <div style="font-size: 1rem; color: #94a3b8;">
                    👥 <strong style="color: #f1f5f9;">{count}</strong> {ui_text['people']}
                </div>
                <div style="font-size: 1rem; color: #94a3b8;">
                    ⏱️ <strong style="color: #f1f5f9;">~{wait_time}</strong> {ui_text['minutes']}
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
    
# Visualization Chart - Full Width Section
st.markdown("###")
st.markdown("---")
if show_chart:
    st.markdown('<div class="section-header"><h2 class="section-title">📈 Queue Comparison Chart</h2></div>', unsafe_allow_html=True)
    
    queue_counts = data.get('queue_counts', [])
    
    if len(queue_counts) > 0:
        st.markdown(f"<p style='color: #94a3b8; font-size: 0.9rem;'>Displaying data for {len(queue_counts)} queues</p>", unsafe_allow_html=True)
        
        # Figma-style graph container
        st.markdown('<div class="graph-container">', unsafe_allow_html=True)
        
        fig = go.Figure()
        
        # Figma-style minimal colors
        colors = ['#00c853' if c == min(queue_counts) else '#ff3b30' if c == max(queue_counts) else '#5551ff' 
                 for c in queue_counts]
        
        fig.add_trace(go.Bar(
            x=[f"Queue {i+1}" for i in range(len(queue_counts))],
            y=queue_counts,
            marker=dict(
                color=colors,
                line=dict(color='#ffffff', width=0),
                opacity=1
            ),
            text=queue_counts,
            textposition='outside',
            textfont=dict(size=16, color='#e5e7eb', family='Inter', weight=600),
            hovertemplate='<b>%{x}</b><br>People: <b>%{y}</b><br>Est. Wait: <b>~%{y:.0f} min</b><extra></extra>',
        ))
        
        fig.update_layout(
            title={
                'text': '<b>Queue Occupancy</b>', 
                'x': 0,
                'xanchor': 'left',
                'font': {'size': 20, 'color': '#e5e7eb', 'family': 'Inter'}
            },
            xaxis=dict(
                title=None,
                tickfont=dict(size=13, color='#cbd5e1', family='Inter'),
                showgrid=False,
                linecolor="#4b5563",
                linewidth=1,
                showline=True
            ),
            yaxis=dict(
                title=dict(
                    text='People',
                    font=dict(size=13, color='#cbd5e1', family='Inter')
                ),
                tickfont=dict(size=12, color='#cbd5e1', family='Inter'),
                gridcolor="#374151",
                showgrid=True,
                linecolor="#4b5563",
                linewidth=1,
                showline=True,
                zeroline=True,
                zerolinecolor="#4b5563",
                zerolinewidth=1
            ),
            height=400,
            showlegend=False,
            margin=dict(l=60, r=40, t=60, b=40),
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(family='Inter', size=13, color='#e5e7eb'),
            hovermode='x unified',
            hoverlabel=dict(
                bgcolor='#111827',
                font_size=13,
                font_family='Inter',
                font_color='#ffffff',
                bordercolor='#374151'
            ),
            bargap=0.3
        )
        
        st.plotly_chart(fig, use_container_width=True)
        st.markdown("</div>", unsafe_allow_html=True)
    else:
        st.info("📊 No queue data available for chart")
