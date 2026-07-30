# 🚀 QRVerse — Premium Modern QR Code Generator Studio

**QRVerse** is a handcrafted, startup-grade QR Code Generator web application built with **Python (Flask)** on the backend and modern vanilla **HTML5, CSS3, and JavaScript** on the frontend. Inspired by world-class design systems like Stripe, Linear, Raycast, Framer, and Apple.

---

## ✨ Features

### 🛠️ Core QR Generation Modes
1. **📄 Text File Mode**: Drag-and-drop `.txt` documents (up to 2MB). Parses plain text content and encodes it directly into a high-density QR matrix.
2. **🔗 URL Mode**: Real-time URL validation with error feedback. Supports all standard HTTP/HTTPS links.
3. **☁️ Google Drive Link Mode**: Seamlessly handles shareable links for files (`drive.google.com/file/d/...`), folders (`drive/folders/...`), spreadsheets, and presentations.

### 🎨 Studio Customization & Aesthetics
- **Custom Color Picker**: Choose custom foreground (QR modules) and background hex colors.
- **Curated Color Presets**: One-click aesthetic themes (Classic Mono, Electric Neon, Cyber Blue, Deep Violet, Emerald).
- **Error Correction Tuning**: Select between Low (L), Medium (M), Quartile (Q), and High (H) error recovery levels.
- **Resolution Scale Slider**: Fine-tune output scaling up to 4K resolution.

### 💎 Premium User Experience
- **Dark & Light Mode Toggle**: Smooth theme transition with state persistence via `localStorage`.
- **Canvas Particle Background**: Ambient interactive node particle system.
- **Confetti Explosion Engine**: Celebratory canvas particle burst upon successful QR creation.
- **Copy Image to Clipboard**: Copy raw PNG image blobs directly to system clipboard.
- **Auto-Purge Security**: Server background thread automatically cleans up uploaded text files and generated PNG images older than 15 minutes.
- **Keyboard Shortcuts**: Press `Ctrl + Enter` (or `Cmd + Enter`) to generate, `Esc` to reset.
- **100% Custom CSS**: Glassmorphism cards, glowing gradient borders, smooth micro-interactions. **No Bootstrap or external CSS frameworks**.

---

## 📂 Project Directory Structure

```
QRVerse/
├── app.py                  # Primary Flask Application & API Routes
├── requirements.txt        # Python Dependencies
├── README.md               # Documentation
├── uploads/                # Temporary Storage for Uploaded Text Files
│   └── .gitkeep
├── generated_qr/           # Temporary Storage for Generated QR PNG Images
│   └── .gitkeep
├── static/
│   ├── css/
│   │   └── style.css       # Complete Custom CSS Design System
│   ├── js/
│   │   └── main.js         # Interactive Frontend Logic & Animations
│   └── images/
│       ├── logo.svg        # Brand Vector Logo
│       └── favicon.svg     # Website Favicon
└── templates/
    └── index.html          # Semantic HTML5 Application Template
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Python 3.9 or higher
- `pip` (Python package manager)

### 1. Installation
Navigate to the project root directory and install dependencies:

```bash
cd c:/Users/dell/Downloads/QRVerse

# (Optional) Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
```

### 2. Launch Server
Start the Flask development server:

```bash
python app.py
```

### 3. Open in Browser
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 🛰️ REST API Endpoints

| Endpoint | Method | Description | Payload Format |
|---|---|---|---|
| `/` | `GET` | Renders the primary web interface | N/A |
| `/api/generate/text-file` | `POST` | Accepts uploaded `.txt` file & returns QR data | `multipart/form-data` |
| `/api/generate/url` | `POST` | Generates QR for a valid website URL | `application/json` |
| `/api/generate/gdrive` | `POST` | Generates QR for a Google Drive link | `application/json` |
| `/api/download/<filename>` | `GET` | Downloads generated QR code PNG | Query string `?name=custom_name` |
| `/api/preview/<filename>` | `GET` | Serves PNG image for inline browser preview | N/A |

---

## 🔒 Security & Privacy

- **No Logging**: Text content and links are parsed strictly in memory and temporary files.
- **Auto Cleanup Sweep**: A background daemon thread sweeps `uploads/` and `generated_qr/` every 5 minutes to purge any temporary files older than 15 minutes.
- **Input Sanitization**: File names are sanitized with `werkzeug.utils.secure_filename`.

---

Made with ❤️ by Senior Full Stack Engineers.
