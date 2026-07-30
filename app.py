import os
import re
import uuid
import time
import base64
import threading
from io import BytesIO
from urllib.parse import urlparse
from flask import Flask, render_template, request, jsonify, send_from_directory, send_file
from werkzeug.utils import secure_filename
import qrcode
from qrcode.constants import (
    ERROR_CORRECT_L,
    ERROR_CORRECT_M,
    ERROR_CORRECT_Q,
    ERROR_CORRECT_H
)
from PIL import Image

app = Flask(__name__)

# System Configurations
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
GENERATED_FOLDER = os.path.join(BASE_DIR, 'generated_qr')
ALLOWED_EXTENSIONS = {'txt'}
MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024  # 2MB Limit

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['GENERATED_FOLDER'] = GENERATED_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE_BYTES

# Ensure required directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(GENERATED_FOLDER, exist_ok=True)


def cleanup_old_files():
    """Background worker function to automatically remove temporary files older than 15 minutes."""
    while True:
        try:
            now = time.time()
            max_age_seconds = 15 * 60  # 15 minutes
            
            for folder in [UPLOAD_FOLDER, GENERATED_FOLDER]:
                if not os.path.exists(folder):
                    continue
                for filename in os.listdir(folder):
                    if filename == '.gitkeep':
                        continue
                    filepath = os.path.join(folder, filename)
                    if os.path.isfile(filepath):
                        file_age = now - os.path.getmtime(filepath)
                        if file_age > max_age_seconds:
                            try:
                                os.remove(filepath)
                            except Exception as e:
                                app.logger.error(f"Error removing file {filepath}: {e}")
        except Exception as e:
            app.logger.error(f"Cleanup thread exception: {e}")
            
        time.sleep(300)  # Run cleanup sweep every 5 minutes


# Start background cleanup thread
cleanup_thread = threading.Thread(target=cleanup_old_files, daemon=True)
cleanup_thread.start()


def allowed_file(filename):
    """Check if uploaded file has allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_error_correction(level_str):
    """Map string representation to qrcode error correction constant."""
    mapping = {
        'L': ERROR_CORRECT_L,
        'M': ERROR_CORRECT_M,
        'Q': ERROR_CORRECT_Q,
        'H': ERROR_CORRECT_H
    }
    return mapping.get(str(level_str).upper(), ERROR_CORRECT_M)


def hex_to_rgb(hex_str):
    """Convert hex color string to RGB tuple, fallback to black/white."""
    if not hex_str or not isinstance(hex_str, str):
        return None
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join([c*2 for c in hex_str])
    if len(hex_str) == 6:
        try:
            return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
        except ValueError:
            pass
    return None


def generate_qr_image_data(content, fg_color="#000000", bg_color="#FFFFFF", box_size=10, border=4, error_correction='M'):
    """
    Generates a QR Code image using qrcode and PIL.
    Saves image to GENERATED_FOLDER and returns metadata + base64 string.
    """
    if not content or not content.strip():
        raise ValueError("Content to encode into QR code cannot be empty.")

    ecc = get_error_correction(error_correction)
    try:
        box_size = int(box_size)
        if box_size < 4:
            box_size = 4
        if box_size > 30:
            box_size = 30
    except (ValueError, TypeError):
        box_size = 10

    qr = qrcode.QRCode(
        version=None,  # Auto fit
        error_correction=ecc,
        box_size=box_size,
        border=int(border)
    )
    
    qr.add_data(content)
    qr.make(fit=True)

    fg_rgb = hex_to_rgb(fg_color) or (0, 0, 0)
    bg_rgb = hex_to_rgb(bg_color) or (255, 255, 255)

    img = qr.make_image(fill_color=fg_rgb, back_color=bg_rgb).convert('RGB')
    
    # Generate unique filename
    unique_id = uuid.uuid4().hex
    filename = f"qr_{unique_id}.png"
    filepath = os.path.join(GENERATED_FOLDER, filename)
    
    img.save(filepath, format="PNG", optimize=True)
    
    # Also generate base64 representation for instant UI rendering
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_b64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    data_url = f"data:image/png;base64,{img_b64}"
    
    return {
        'filename': filename,
        'filepath': filepath,
        'data_url': data_url,
        'download_url': f"/api/download/{filename}",
        'preview_url': f"/api/preview/{filename}"
    }


def is_valid_url(url_string):
    """Validate general HTTP/HTTPS URL format."""
    if not url_string:
        return False
    url_string = url_string.strip()
    regex = re.compile(
        r'^(?:http|ftp)s?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return re.match(regex, url_string) is not None


def is_valid_gdrive_url(url_string):
    """Validate Google Drive URL format."""
    if not url_string:
        return False
    url_string = url_string.strip()
    gdrive_patterns = [
        r'drive\.google\.com/(?:file/d/|drive/folders/|open\?id=|uc\?id=)',
        r'docs\.google\.com/(?:document/d/|spreadsheets/d/|presentation/d/|forms/d/)'
    ]
    return any(re.search(pattern, url_string, re.IGNORECASE) for pattern in gdrive_patterns)


# ==========================================
# ROUTES
# ==========================================

@app.route('/')
def index():
    """Render main QRVerse Web Application page."""
    return render_template('index.html')


@app.route('/api/generate/text-file', methods=['POST'])
def generate_from_text_file():
    """Handle text file upload and QR generation."""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'No file part in request'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected for upload'}), 400

        if not allowed_file(file.filename):
            return jsonify({'success': False, 'message': 'Only .txt files are supported'}), 400

        # Read file content safely
        file_bytes = file.read()
        if len(file_bytes) == 0:
            return jsonify({'success': False, 'message': 'Uploaded file is empty'}), 400

        if len(file_bytes) > MAX_FILE_SIZE_BYTES:
            return jsonify({'success': False, 'message': 'File size exceeds 2MB limit'}), 400

        try:
            content = file_bytes.decode('utf-8')
        except UnicodeDecodeError:
            try:
                content = file_bytes.decode('latin-1')
            except Exception:
                return jsonify({'success': False, 'message': 'Failed to decode file encoding'}), 400

        if not content.strip():
            return jsonify({'success': False, 'message': 'Text file contains no printable text'}), 400

        # Retrieve optional customization parameters
        fg_color = request.form.get('fg_color', '#000000')
        bg_color = request.form.get('bg_color', '#FFFFFF')
        box_size = request.form.get('box_size', 10)
        error_correction = request.form.get('error_correction', 'M')

        # Generate QR code
        result = generate_qr_image_data(
            content=content,
            fg_color=fg_color,
            bg_color=bg_color,
            box_size=box_size,
            error_correction=error_correction
        )

        char_count = len(content)
        word_count = len(content.split())
        summary = f"Text File: {secure_filename(file.filename)} ({char_count} chars, {word_count} words)"

        return jsonify({
            'success': True,
            'message': 'QR code generated successfully from text file!',
            'data_url': result['data_url'],
            'download_url': result['download_url'],
            'preview_url': result['preview_url'],
            'filename': result['filename'],
            'summary': summary,
            'original_filename': secure_filename(file.filename)
        })

    except Exception as e:
        app.logger.error(f"Text file QR generation error: {e}")
        return jsonify({'success': False, 'message': f"An error occurred: {str(e)}"}), 500


@app.route('/api/generate/url', methods=['POST'])
def generate_from_url():
    """Handle URL QR generation."""
    try:
        data = request.get_json() or {}
        raw_url = data.get('url', '').strip()

        if not raw_url:
            return jsonify({'success': False, 'message': 'URL field cannot be empty'}), 400

        # Auto-prepend http:// if scheme missing for standard domain pattern
        if not raw_url.startswith(('http://', 'https://', 'ftp://')):
            formatted_url = 'https://' + raw_url
        else:
            formatted_url = raw_url

        if not is_valid_url(formatted_url):
            return jsonify({'success': False, 'message': 'Invalid URL format. Please provide a valid website URL.'}), 400

        fg_color = data.get('fg_color', '#000000')
        bg_color = data.get('bg_color', '#FFFFFF')
        box_size = data.get('box_size', 10)
        error_correction = data.get('error_correction', 'M')

        result = generate_qr_image_data(
            content=formatted_url,
            fg_color=fg_color,
            bg_color=bg_color,
            box_size=box_size,
            error_correction=error_correction
        )

        domain = urlparse(formatted_url).netloc or formatted_url

        return jsonify({
            'success': True,
            'message': 'QR code generated successfully for URL!',
            'data_url': result['data_url'],
            'download_url': result['download_url'],
            'preview_url': result['preview_url'],
            'filename': result['filename'],
            'summary': f"URL Target: {domain}",
            'encoded_url': formatted_url
        })

    except Exception as e:
        app.logger.error(f"URL QR generation error: {e}")
        return jsonify({'success': False, 'message': f"An error occurred: {str(e)}"}), 500


@app.route('/api/generate/gdrive', methods=['POST'])
def generate_from_gdrive():
    """Handle Google Drive link QR generation."""
    try:
        data = request.get_json() or {}
        gdrive_url = data.get('drive_url', '').strip()

        if not gdrive_url:
            return jsonify({'success': False, 'message': 'Google Drive link field cannot be empty'}), 400

        if not gdrive_url.startswith(('http://', 'https://')):
            gdrive_url = 'https://' + gdrive_url

        if not is_valid_gdrive_url(gdrive_url):
            return jsonify({
                'success': False,
                'message': 'Invalid Google Drive link. Please ensure link starts with drive.google.com or docs.google.com'
            }), 400

        fg_color = data.get('fg_color', '#000000')
        bg_color = data.get('bg_color', '#FFFFFF')
        box_size = data.get('box_size', 10)
        error_correction = data.get('error_correction', 'M')

        result = generate_qr_image_data(
            content=gdrive_url,
            fg_color=fg_color,
            bg_color=bg_color,
            box_size=box_size,
            error_correction=error_correction
        )

        return jsonify({
            'success': True,
            'message': 'QR code generated successfully for Google Drive link!',
            'data_url': result['data_url'],
            'download_url': result['download_url'],
            'preview_url': result['preview_url'],
            'filename': result['filename'],
            'summary': 'Google Drive Cloud Asset Link',
            'encoded_url': gdrive_url
        })

    except Exception as e:
        app.logger.error(f"Google Drive QR generation error: {e}")
        return jsonify({'success': False, 'message': f"An error occurred: {str(e)}"}), 500


@app.route('/api/preview/<filename>')
def preview_file(filename):
    """Serve QR PNG for inline browser preview."""
    safe_name = secure_filename(filename)
    filepath = os.path.join(GENERATED_FOLDER, safe_name)
    if not os.path.isfile(filepath):
        return jsonify({'error': 'Requested image not found or expired'}), 404
    return send_from_directory(GENERATED_FOLDER, safe_name, mimetype='image/png')


@app.route('/api/download/<filename>')
def download_file(filename):
    """Download generated QR PNG as file attachment."""
    safe_name = secure_filename(filename)
    filepath = os.path.join(GENERATED_FOLDER, safe_name)
    if not os.path.isfile(filepath):
        return jsonify({'error': 'Requested image not found or expired'}), 404
    
    # Custom download name
    custom_name = request.args.get('name', 'QRVerse_Code')
    if not custom_name.endswith('.png'):
        custom_name += '.png'
    custom_name = secure_filename(custom_name)

    return send_file(
        filepath,
        mimetype='image/png',
        as_attachment=True,
        download_name=custom_name
    )


@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'success': False, 'message': 'Resource not found'}), 404


@app.errorhandler(413)
def too_large_error(error):
    return jsonify({'success': False, 'message': 'File size exceeds maximum allowed limit (2MB)'}), 413


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'message': 'Internal Server Error'}), 500


if __name__ == '__main__':
    print("=" * 60)
    print(" 🚀 QRVerse - Premium QR Code Generator Server")
    print(" 🌐 Running on http://127.0.0.1:5000")
    print("=" * 60)
    app.run(host='127.0.0.1', port=5000, debug=True)
