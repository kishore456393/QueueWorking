import streamlit as st

# Page config with custom theme
st.set_page_config(
    page_title='QueueGuidance - AI Queue Management',
    page_icon='🎯',
    layout='wide',
    initial_sidebar_state='expanded'
)

# Custom CSS - Figma-Inspired Design
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
    
    /* ===== ROOT VARIABLES (Professional Dark Theme) ===== */
    :root {
        --bg-primary: #0f172a;      /* Slate-900 */
        --bg-secondary: #1e293b;    /* Slate-800 */
        --surface: #334155;         /* Slate-700 */
        --surface-light: #475569;   /* Slate-600 */
        --border: #475569;          /* Slate-600 */
        --text-primary: #f8fafc;    /* Slate-50 */
        --text-secondary: #cbd5e1;  /* Slate-300 */
        --accent-primary: #6366f1;  /* Indigo-500 */
        --accent-secondary: #8b5cf6; /* Violet-500 */
        --accent-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
        --success: #10b981;         /* Emerald-500 */
        --warning: #f59e0b;         /* Amber-500 */
        --error: #ef4444;           /* Red-500 */
        --radius-xl: 1.5rem;
        --radius-lg: 1rem;
        --radius-md: 0.75rem;
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
        --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
    }
    
    /* ===== MAIN LAYOUT ===== */
    .main {
        background: var(--bg-primary) !important;
        background-image: 
            radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.1) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%);
    }
    
    .block-container {
        padding: 3rem 2.5rem !important;
        max-width: 1400px !important;
    }
    
    /* ===== SIDEBAR ===== */
    [data-testid="stSidebar"] {
        background: var(--surface) !important;
        border-right: 1px solid var(--border) !important;
        width: 280px !important;
        min-width: 280px !important;
        box-shadow: var(--shadow-sm);
    }
    
    [data-testid="stSidebar"] .stRadio > div {
        gap: 0.5rem;
    }

    [data-testid="stSidebar"] .stRadio [data-baseweb="radio"] {
        height: 44px;
        width: 100%;
        border-radius: var(--radius-lg);
        padding: 0 1rem;
        transition: background 0.2s ease;
    }
    
    [data-testid="stSidebar"] .stRadio [data-baseweb="radio"]:has(input:checked) {
        background: var(--accent-gradient);
        color: white;
    }
    
    [data-testid="stSidebar"] .stRadio [data-baseweb="radio"]:hover {
        background: #fafbff;
    }
    
    [data-testid="stSidebar"] .stRadio [data-baseweb="radio"]:has(input:checked):hover {
        background: var(--accent-gradient);
        opacity: 0.9;
    }
    
    [data-testid="stSidebar"] .stRadio label {
        font-weight: 500;
        font-size: 14px;
    }
    
    /* ===== MAIN HEADER ===== */
    .main-header {
        background: var(--surface);
        padding: 2.5rem;
        border-radius: var(--radius-xl);
        text-align: center;
        margin-bottom: 2rem;
        border: 1px solid var(--border);
        box-shadow: var(--shadow-sm);
    }
    
    .main-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }
    
    .subtitle {
        font-size: 1.1rem;
        color: var(--text-secondary);
        font-weight: 400;
    }
    
    /* ===== FEATURE CARDS ===== */
    .feature-card {
        background: var(--surface);
        padding: 2rem;
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-sm);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        height: 100%;
        border: 1px solid var(--border);
        text-align: center;
    }
    
    .feature-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
    }
    
    .feature-icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        display: inline-block;
        background: var(--accent-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    .feature-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }
    
    .feature-text {
        color: var(--text-secondary);
        font-size: 0.95rem;
        line-height: 1.6;
    }
    
    /* ===== BUTTONS ===== */
    .stButton > button {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%) !important;
        color: white !important;
        border: none !important;
        padding: 0.75rem 2rem !important;
        font-size: 1.1rem !important;
        font-weight: 600 !important;
        border-radius: 0.75rem !important;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4) !important;
        transition: all 0.3s ease !important;
        cursor: pointer !important;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6) !important;
    }
    
    .stButton > button:active {
        transform: translateY(0) !important;
    }

    /* ===== EXPANDER ===== */
    .st-expander {
        background: rgba(30, 41, 59, 0.6) !important;
        backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(99, 102, 241, 0.2) !important;
        border-radius: var(--radius-xl) !important;
        box-shadow: var(--shadow-md) !important;
    }
    
    .st-expander header {
        font-size: 1.2rem !important;
        font-weight: 600 !important;
        color: var(--text-primary) !important;
    }
    
    /* ===== ANIMATIONS ===== */
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
    }
    
    /* ===== SCROLLBAR ===== */
    ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
    }
    
    ::-webkit-scrollbar-track {
        background: var(--bg-secondary);
    }
    
    ::-webkit-scrollbar-thumb {
        background: var(--surface);
        border-radius: 5px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: var(--surface-light);
    }
    
    /* ===== HIDE STREAMLIT BRANDING ===== */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}

    /* Floating Sidebar Toggle Button */
    .qs-toggle-btn { position: fixed; top: 16px; left: 16px; z-index: 10000; }
    .qs-toggle-btn button {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
        color: #fff; border: 0; border-radius: 999px; padding: 8px 12px;
        font-weight: 700; box-shadow: 0 6px 20px rgba(0,0,0,0.25); cursor: pointer;
    }
    @media (min-width: 1200px) { .qs-toggle-btn { top: 20px; left: 20px; } }
</style>
""", unsafe_allow_html=True)

# Floating Sidebar Toggle Button (in case header toggle is hidden)
import streamlit.components.v1 as components
components.html(
        """
        <script>
        (function(){
            try {
                const d = window.parent.document;
                if (d.querySelector('.qs-toggle-btn')) return; // already injected

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
                    for (const s of sels) {
                        const el = d.querySelector(s);
                        if (el) { el.click(); clicked = true; break; }
                    }
                    if (!clicked) {
                        // Fallback: force-open via CSS override
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
            } catch (e) { /* ignore */ }
        })();
        </script>
        """,
        height=0,
)

# Header
st.markdown("""
<div class="main-header">
    <div class="main-title">🎯 QueueGuidance</div>
    <div class="subtitle">AI-Powered Intelligent Queue Management System</div>
</div>
""", unsafe_allow_html=True)

# Sidebar Navigation
with st.sidebar:
    st.markdown("## 📍 Navigation")
    st.markdown("###")
    
    selected_page = st.radio(
        "Choose a page:",
        ["🏠 Home", "🎥 Setup & Process", "📊 Live Dashboard"],
        label_visibility="collapsed"
    )
    
    st.markdown("---")
    st.markdown("### ℹ️ System Info")
    st.markdown("""
    <div style='background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;'>
        <p style='margin: 0; font-size: 0.9rem;'>
        ✓ AI-Powered Detection<br>
        ✓ Real-time Analytics<br>
        ✓ Multi-language Support<br>
        ✓ Smart Recommendations
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    st.markdown("### 📞 Need Help?")
    st.markdown("Check the step-by-step guides on each page.")

# Main content based on selection
if selected_page == "🏠 Home":
    # Hero Section with Gradient
    st.markdown("""
    <div style='text-align: center; padding: 4rem 2rem; margin-bottom: 3rem;'>
        <h1 style='font-size: 3.5rem; font-weight: 800; 
                   background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
                   -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                   margin-bottom: 1rem; line-height: 1.2;'>
            QueueGuidance
        </h1>
        <p style='font-size: 1.4rem; color: #cbd5e1; font-weight: 400; margin-bottom: 0.5rem;'>
            AI-Powered Intelligent Queue Management System
        </p>
        <p style='font-size: 1.1rem; color: #94a3b8; max-width: 700px; margin: 0 auto;'>
            Transform your queue management with cutting-edge AI technology.<br>
            Upload videos, define zones, and get real-time intelligent insights.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Stats Bar with Glassmorphism
    st.markdown("""
    <div style='display: flex; justify-content: center; gap: 2rem; margin-bottom: 4rem; flex-wrap: wrap;'>
        <div style='background: rgba(99, 102, 241, 0.1); backdrop-filter: blur(10px);
                    padding: 1.5rem 2rem; border-radius: 1rem; border: 1px solid rgba(99, 102, 241, 0.2);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); text-align: center; min-width: 180px;'>
            <div style='font-size: 2rem; font-weight: 700; color: #6366f1; margin-bottom: 0.3rem;'>98%</div>
            <div style='font-size: 0.9rem; color: #cbd5e1; font-weight: 500;'>Accuracy</div>
        </div>
        <div style='background: rgba(139, 92, 246, 0.1); backdrop-filter: blur(10px);
                    padding: 1.5rem 2rem; border-radius: 1rem; border: 1px solid rgba(139, 92, 246, 0.2);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); text-align: center; min-width: 180px;'>
            <div style='font-size: 2rem; font-weight: 700; color: #8b5cf6; margin-bottom: 0.3rem;'>&lt;2s</div>
            <div style='font-size: 0.9rem; color: #cbd5e1; font-weight: 500;'>Detection Speed</div>
        </div>
        <div style='background: rgba(236, 72, 153, 0.1); backdrop-filter: blur(10px);
                    padding: 1.5rem 2rem; border-radius: 1rem; border: 1px solid rgba(236, 72, 153, 0.2);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); text-align: center; min-width: 180px;'>
            <div style='font-size: 2rem; font-weight: 700; color: #ec4899; margin-bottom: 0.3rem;'>14+</div>
            <div style='font-size: 0.9rem; color: #cbd5e1; font-weight: 500;'>Languages</div>
        </div>
        <div style='background: rgba(16, 185, 129, 0.1); backdrop-filter: blur(10px);
                    padding: 1.5rem 2rem; border-radius: 1rem; border: 1px solid rgba(16, 185, 129, 0.2);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); text-align: center; min-width: 180px;'>
            <div style='font-size: 2rem; font-weight: 700; color: #10b981; margin-bottom: 0.3rem;'>∞</div>
            <div style='font-size: 0.9rem; color: #cbd5e1; font-weight: 500;'>Queue Zones</div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Feature Cards Section
    st.markdown("""
    <h2 style='text-align: center; font-size: 2rem; font-weight: 700; color: #f8fafc; margin-bottom: 2.5rem;'>
        ✨ Powerful Features
    </h2>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3, gap="large")
    
    with col1:
        st.markdown("""
        <div style='background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(12px);
                    padding: 2.5rem; border-radius: 1.25rem; border: 1px solid rgba(99, 102, 241, 0.2);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4); transition: all 0.3s ease;
                    height: 100%; cursor: pointer;'
             onmouseover='this.style.transform="translateY(-8px)"; this.style.boxShadow="0 12px 35px rgba(99, 102, 241, 0.3)"'
             onmouseout='this.style.transform="translateY(0)"; this.style.boxShadow="0 8px 25px rgba(0, 0, 0, 0.4)"'>
            <div style='font-size: 3rem; margin-bottom: 1.25rem; text-align: center;'>🎥</div>
            <div style='font-size: 1.35rem; font-weight: 600; color: #f8fafc; margin-bottom: 0.75rem; text-align: center;'>
                Upload & Process
            </div>
            <div style='color: #cbd5e1; font-size: 1rem; line-height: 1.7; text-align: center;'>
                Upload queue videos and define custom zones using an intuitive 
                point-and-click interface. Support for multiple queue areas.
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div style='background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(12px);
                    padding: 2.5rem; border-radius: 1.25rem; border: 1px solid rgba(139, 92, 246, 0.2);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4); transition: all 0.3s ease;
                    height: 100%; cursor: pointer;'
             onmouseover='this.style.transform="translateY(-8px)"; this.style.boxShadow="0 12px 35px rgba(139, 92, 246, 0.3)"'
             onmouseout='this.style.transform="translateY(0)"; this.style.boxShadow="0 8px 25px rgba(0, 0, 0, 0.4)"'>
            <div style='font-size: 3rem; margin-bottom: 1.25rem; text-align: center;'>🧠</div>
            <div style='font-size: 1.35rem; font-weight: 600; color: #f8fafc; margin-bottom: 0.75rem; text-align: center;'>
                AI Detection
            </div>
            <div style='color: #cbd5e1; font-size: 1rem; line-height: 1.7; text-align: center;'>
                Advanced YOLO-based person detection with high accuracy. 
                Real-time queue counting and analysis running in background.
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div style='background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(12px);
                    padding: 2.5rem; border-radius: 1.25rem; border: 1px solid rgba(236, 72, 153, 0.2);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4); transition: all 0.3s ease;
                    height: 100%; cursor: pointer;'
             onmouseover='this.style.transform="translateY(-8px)"; this.style.boxShadow="0 12px 35px rgba(236, 72, 153, 0.3)"'
             onmouseout='this.style.transform="translateY(0)"; this.style.boxShadow="0 8px 25px rgba(0, 0, 0, 0.4)"'>
            <div style='font-size: 3rem; margin-bottom: 1.25rem; text-align: center;'>📊</div>
            <div style='font-size: 1.35rem; font-weight: 600; color: #f8fafc; margin-bottom: 0.75rem; text-align: center;'>
                Live Dashboard
            </div>
            <div style='color: #cbd5e1; font-size: 1rem; line-height: 1.7; text-align: center;'>
                Real-time analytics with auto-refresh, interactive charts, 
                and multi-language audio announcements.
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("###")
    
    # Second row of features
    col1, col2, col3 = st.columns(3, gap="large")
    
    with col1:
        st.markdown("""
        <div style='background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(12px);
                    padding: 2.5rem; border-radius: 1.25rem; border: 1px solid rgba(16, 185, 129, 0.2);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4); transition: all 0.3s ease;
                    height: 100%; cursor: pointer;'
             onmouseover='this.style.transform="translateY(-8px)"; this.style.boxShadow="0 12px 35px rgba(16, 185, 129, 0.3)"'
             onmouseout='this.style.transform="translateY(0)"; this.style.boxShadow="0 8px 25px rgba(0, 0, 0, 0.4)"'>
            <div style='font-size: 3rem; margin-bottom: 1.25rem; text-align: center;'>🌍</div>
            <div style='font-size: 1.35rem; font-weight: 600; color: #f8fafc; margin-bottom: 0.75rem; text-align: center;'>
                Multi-Language
            </div>
            <div style='color: #cbd5e1; font-size: 1rem; line-height: 1.7; text-align: center;'>
                Support for 14+ languages including English, Hindi, Tamil, Telugu, 
                Bengali, and more with voice announcements.
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div style='background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(12px);
                    padding: 2.5rem; border-radius: 1.25rem; border: 1px solid rgba(245, 158, 11, 0.2);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4); transition: all 0.3s ease;
                    height: 100%; cursor: pointer;'
             onmouseover='this.style.transform="translateY(-8px)"; this.style.boxShadow="0 12px 35px rgba(245, 158, 11, 0.3)"'
             onmouseout='this.style.transform="translateY(0)"; this.style.boxShadow="0 8px 25px rgba(0, 0, 0, 0.4)"'>
            <div style='font-size: 3rem; margin-bottom: 1.25rem; text-align: center;'>⚡</div>
            <div style='font-size: 1.35rem; font-weight: 600; color: #f8fafc; margin-bottom: 0.75rem; text-align: center;'>
                Real-Time Updates
            </div>
            <div style='color: #cbd5e1; font-size: 1rem; line-height: 1.7; text-align: center;'>
                Live dashboard with auto-refresh functionality (1-10s intervals). 
                Instant notifications and recommendations.
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div style='background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(12px);
                    padding: 2.5rem; border-radius: 1.25rem; border: 1px solid rgba(99, 102, 241, 0.2);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4); transition: all 0.3s ease;
                    height: 100%; cursor: pointer;'
             onmouseover='this.style.transform="translateY(-8px)"; this.style.boxShadow="0 12px 35px rgba(99, 102, 241, 0.3)"'
             onmouseout='this.style.transform="translateY(0)"; this.style.boxShadow="0 8px 25px rgba(0, 0, 0, 0.4)"'>
            <div style='font-size: 3rem; margin-bottom: 1.25rem; text-align: center;'>🎯</div>
            <div style='font-size: 1.35rem; font-weight: 600; color: #f8fafc; margin-bottom: 0.75rem; text-align: center;'>
                Smart Analytics
            </div>
            <div style='color: #cbd5e1; font-size: 1rem; line-height: 1.7; text-align: center;'>
                Get intelligent recommendations, queue comparisons, and 
                predictive wait time estimates for optimal flow.
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("###")
    st.markdown("###")
    
    # How It Works Section
    st.markdown("""
    <h2 style='text-align: center; font-size: 2rem; font-weight: 700; color: #f8fafc; margin-bottom: 2.5rem; margin-top: 2rem;'>
        🚀 How It Works
    </h2>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3, gap="large")
    
    with col1:
        st.markdown("""
        <div style='text-align: center; padding: 2rem;'>
            <div style='width: 80px; height: 80px; border-radius: 50%; 
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                        margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center;
                        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);'>
                <span style='font-size: 2rem; font-weight: 700; color: white;'>1</span>
            </div>
            <h3 style='color: #f8fafc; font-size: 1.4rem; font-weight: 600; margin-bottom: 0.75rem;'>Upload Video</h3>
            <p style='color: #cbd5e1; font-size: 1rem; line-height: 1.7;'>
                Upload your queue surveillance video and the system will prepare it for processing.
            </p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div style='text-align: center; padding: 2rem;'>
            <div style='width: 80px; height: 80px; border-radius: 50%; 
                        background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                        margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center;
                        box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);'>
                <span style='font-size: 2rem; font-weight: 700; color: white;'>2</span>
            </div>
            <h3 style='color: #f8fafc; font-size: 1.4rem; font-weight: 600; margin-bottom: 0.75rem;'>Define Zones</h3>
            <p style='color: #cbd5e1; font-size: 1rem; line-height: 1.7;'>
                Draw polygon zones around your queues using the interactive canvas interface.
            </p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div style='text-align: center; padding: 2rem;'>
            <div style='width: 80px; height: 80px; border-radius: 50%; 
                        background: linear-gradient(135deg, #ec4899 0%, #10b981 100%);
                        margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center;
                        box-shadow: 0 8px 20px rgba(236, 72, 153, 0.4);'>
                <span style='font-size: 2rem; font-weight: 700; color: white;'>3</span>
            </div>
            <h3 style='color: #f8fafc; font-size: 1.4rem; font-weight: 600; margin-bottom: 0.75rem;'>Monitor Live</h3>
            <p style='color: #cbd5e1; font-size: 1rem; line-height: 1.7;'>
                View real-time analytics, get smart recommendations, and optimize queue flow.
            </p>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("###")
    st.markdown("---")
    st.markdown("###")
    
    # Technical Specs Section
    st.markdown("""
    <h2 style='text-align: center; font-size: 2rem; font-weight: 700; color: #f8fafc; margin-bottom: 2.5rem;'>
        ⚙️ Technical Specifications
    </h2>
    """, unsafe_allow_html=True)
    
    col1, col2 = st.columns(2, gap="large")
    
    with col1:
        st.markdown("""
        <div style='background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(12px);
                    padding: 2rem; border-radius: 1rem; border: 1px solid rgba(99, 102, 241, 0.3);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);'>
            <h3 style='color: #6366f1; font-size: 1.3rem; font-weight: 600; margin-bottom: 1.5rem;'>AI & Detection</h3>
            <ul style='color: #cbd5e1; font-size: 1rem; line-height: 2; list-style: none; padding: 0;'>
                <li>✓ YOLOv8 Person Detection</li>
                <li>✓ 98% Accuracy Rate</li>
                <li>✓ <2s Processing Speed</li>
                <li>✓ Multi-Zone Support</li>
                <li>✓ Confidence Threshold: 0.25</li>
                <li>✓ Real-time Frame Processing</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div style='background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(12px);
                    padding: 2rem; border-radius: 1rem; border: 1px solid rgba(139, 92, 246, 0.3);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);'>
            <h3 style='color: #8b5cf6; font-size: 1.3rem; font-weight: 600; margin-bottom: 1.5rem;'>Platform Features</h3>
            <ul style='color: #cbd5e1; font-size: 1rem; line-height: 2; list-style: none; padding: 0;'>
                <li>✓ Streamlit Web Interface</li>
                <li>✓ Plotly Interactive Charts</li>
                <li>✓ Auto-Refresh (1-10s)</li>
                <li>✓ 14+ Language Support</li>
                <li>✓ Audio Announcements</li>
                <li>✓ Responsive Design</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("###")
    st.markdown("###")
    
    # CTA Section
    st.markdown("""
    <div style='text-align: center; padding: 3rem 2rem; 
                background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
                border-radius: 1.5rem; border: 1px solid rgba(99, 102, 241, 0.3);
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4); margin-top: 2rem;'>
        <h2 style='font-size: 2.2rem; font-weight: 700; color: #f8fafc; margin-bottom: 1rem;'>
            Ready to Get Started?
        </h2>
        <p style='font-size: 1.2rem; color: #cbd5e1; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;'>
            Transform your queue management today with AI-powered insights and real-time analytics.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 1, 1])
    with col2:
        if st.button("🚀 Start Now", type="primary", use_container_width=True):
            st.switch_page("pages/2_🎥_Video_Upload.py")
    
    st.markdown("###")
    
    # Quick Start Guide
    with st.expander("📖 Quick Start Guide", expanded=False):
        st.markdown("""
        ### How to Use QueueGuidance:
        
        #### Step 1: Setup & Process
        - Upload your queue video
        - Draw polygon zones around queues
        - Start AI detection
        
        #### Step 2: Live Dashboard
        - View real-time queue statistics
        - See which queue is fastest
        - Get recommendations for customers
        
        #### Step 3: Monitor & Optimize
        - Track queue performance
        - Identify bottlenecks
        - Improve customer experience
        """)
    
    st.markdown("###")
    st.success("� Use the sidebar to navigate to 'Setup & Process' to get started!")

elif selected_page == "🎥 Setup & Process":
    st.switch_page("pages/2_🎥_Video_Upload.py")
    
elif selected_page == "📊 Live Dashboard":
    st.switch_page("pages/3_🧠_Live_Dashboard.py")
