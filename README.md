# ⚡ Quick QR Code Generator

A lightweight Python utility to instantly convert text, files, or cloud links (Google Drive, GitHub, etc.) into scannable QR codes.

---

## ✨ Features

* **Versatile Inputs:** Generates QR codes from:
  * Plain text or URLs.
  * Local file contents (`.txt`, `.py`, `.html`, etc.).
  * Shared cloud folders (e.g., zipped folders uploaded to Google Drive).
* **Smart Input Handling:** Automatically strips accidental quotes from paths/links.
* **Custom Naming:** Prompts you for a custom output filename.

---

## 🚀 Getting Started

### Prerequisites
* Python 3.7+
* `qrcode` library with Pillow support

### Installation
```bash
pip install qrcode[pil]
```
## 🛠️ How to Use Zipped Folders
    To share an entire folder via QR code:
     * Compress your folder into a .zip file.
     * Upload it to Google Drive.
     * Set the sharing permission to "Anyone with the link" (Public).
     * Copy the link and paste it into the generator!

## 👨‍💻 Author
abishek-005

AI/ML Developer | Python Developer | Tech Enthusiast

📫 Contact: ak.abishek005@gmail.com

🌐 GitHub: @abishek-005
