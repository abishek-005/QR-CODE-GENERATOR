/**
 * QRVerse Studio — Master JavaScript Engine
 * Modern, Interactive, Micro-animated Frontend Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. STATE & DOM ELEMENTS
    // =========================================================================
    const state = {
        activeTab: 'text',          // 'text' | 'url' | 'gdrive'
        selectedFile: null,
        generatedData: null,        // Stores API response
        isGenerating: false
    };

    // DOM Elements
    const body = document.documentElement;
    const header = document.querySelector('.header');
    const scrollProgress = document.getElementById('scroll-progress');
    const mouseGlow = document.getElementById('mouse-glow');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
    const navMenu = document.getElementById('nav-menu');
    const backToTopBtn = document.getElementById('back-to-top-btn');
    const toastContainer = document.getElementById('toast-container');

    // Generator Tab Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const tabIndicator = document.getElementById('tab-indicator');

    // File Upload Elements
    const dropzone = document.getElementById('dropzone');
    const textFileInput = document.getElementById('text-file-input');
    const fileInfoBox = document.getElementById('file-info');
    const fileNameDisplay = document.getElementById('file-name-display');
    const fileSizeDisplay = document.getElementById('file-size-display');
    const removeFileBtn = document.getElementById('remove-file-btn');

    // Input Elements
    const urlInput = document.getElementById('url-input');
    const urlValidationMsg = document.getElementById('url-validation-msg');
    const urlValidIcon = document.getElementById('url-valid-icon');

    const gdriveInput = document.getElementById('gdrive-input');
    const gdriveValidationMsg = document.getElementById('gdrive-validation-msg');
    const gdriveValidIcon = document.getElementById('gdrive-valid-icon');

    // Customization Elements
    const customAccordionBtn = document.getElementById('custom-accordion-btn');
    const customAccordionBody = document.getElementById('custom-accordion-body');
    const fgColorInput = document.getElementById('fg-color');
    const fgColorHex = document.getElementById('fg-color-hex');
    const bgColorInput = document.getElementById('bg-color');
    const bgColorHex = document.getElementById('bg-color-hex');
    const eccSelect = document.getElementById('ecc-select');
    const boxSizeSlider = document.getElementById('box-size-slider');
    const sliderValueDisplay = document.getElementById('slider-value-display');
    const presetChips = document.querySelectorAll('.preset-chip');

    // Generate & Result Elements
    const generateBtn = document.getElementById('generate-btn');
    const btnText = generateBtn.querySelector('.btn-text');
    const btnSpinner = generateBtn.querySelector('.btn-spinner');

    const resultSection = document.getElementById('result-section');
    const resultSummaryText = document.getElementById('result-summary-text');
    const resultQrImg = document.getElementById('result-qr-img');
    const qrSkeleton = document.getElementById('qr-skeleton');
    const downloadBtn = document.getElementById('download-btn');
    const copyImageBtn = document.getElementById('copy-image-btn');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const resetBtn = document.getElementById('reset-btn');

    // =========================================================================
    // 2. THEME ENGINE & SCROLL TRACKING
    // =========================================================================
    const savedTheme = localStorage.getItem('qrverse_theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('qrverse_theme', newTheme);
        showToast(`Switched to ${newTheme.toUpperCase()} theme mode`, 'info');
    });

    // Mobile Nav Drawer Toggle
    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggleBtn.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });
    }

    // Scroll Progress & Sticky Header
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollProgress.style.width = scrolled + '%';

        if (winScroll > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        if (winScroll > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Mouse Radial Glow Tracking
    window.addEventListener('mousemove', (e) => {
        if (mouseGlow) {
            mouseGlow.style.left = e.clientX + 'px';
            mouseGlow.style.top = e.clientY + 'px';
        }
    });

    // =========================================================================
    // 3. BACKGROUND CANVAS PARTICLES ENGINE
    // =========================================================================
    const initParticles = () => {
        const canvas = document.getElementById('bg-particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = Math.floor(width / 30);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 2 + 1;
                this.alpha = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(108, 99, 255, ${this.alpha})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // Draw subtle connecting lines
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 110) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(108, 99, 255, ${0.15 * (1 - dist / 110)})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        };

        animate();

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });
    };
    initParticles();

    // =========================================================================
    // 4. TAB SWITCHER SYSTEM
    // =========================================================================
    const updateTabIndicator = (index) => {
        tabIndicator.style.transform = `translateX(${index * 100}%)`;
    };

    tabBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            state.activeTab = btn.getAttribute('data-tab');

            const targetPane = document.getElementById(`tab-pane-${state.activeTab}`);
            if (targetPane) {
                targetPane.classList.add('active');
            }

            updateTabIndicator(index);
        });
    });

    // =========================================================================
    // 5. DRAG & DROP FILE UPLOAD
    // =========================================================================
    if (dropzone && textFileInput) {
        dropzone.addEventListener('click', (e) => {
            if (e.target.closest('#remove-file-btn')) return;
            textFileInput.click();
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('dragover');
            });
        });

        dropzone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleSelectedFile(files[0]);
            }
        });

        textFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleSelectedFile(e.target.files[0]);
            }
        });

        const handleSelectedFile = (file) => {
            if (!file.name.toLowerCase().endsWith('.txt')) {
                showToast('Only .txt format files are supported', 'error');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                showToast('File size exceeds 2MB limit', 'error');
                return;
            }

            state.selectedFile = file;
            fileNameDisplay.textContent = file.name;
            fileSizeDisplay.textContent = formatBytes(file.size);

            dropzone.querySelector('.dropzone-body').classList.add('hidden');
            fileInfoBox.classList.remove('hidden');

            showToast(`Loaded file: ${file.name}`, 'success');
        };

        if (removeFileBtn) {
            removeFileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                clearSelectedFile();
            });
        }
    }

    const clearSelectedFile = () => {
        state.selectedFile = null;
        textFileInput.value = '';
        fileInfoBox.classList.add('hidden');
        dropzone.querySelector('.dropzone-body').classList.remove('hidden');
    };

    // =========================================================================
    // 6. REAL-TIME INPUT VALIDATORS
    // =========================================================================
    const isValidUrl = (string) => {
        if (!string) return false;
        try {
            const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
                '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
            return !!pattern.test(string);
        } catch (_) {
            return false;
        }
    };

    const isValidGDriveUrl = (string) => {
        if (!string) return false;
        const gdrivePattern = /(drive\.google\.com|docs\.google\.com)/i;
        return gdrivePattern.test(string);
    };

    urlInput.addEventListener('input', () => {
        const val = urlInput.value.strip ? urlInput.value.strip() : urlInput.value.trim();
        if (val.length === 0) {
            urlValidationMsg.classList.add('hidden');
            urlValidIcon.innerHTML = '';
            return;
        }

        if (isValidUrl(val)) {
            urlValidationMsg.classList.add('hidden');
            urlValidIcon.innerHTML = '<i class="fa-solid fa-circle-check text-success" style="color: #10B981;"></i>';
        } else {
            urlValidationMsg.classList.remove('hidden');
            urlValidIcon.innerHTML = '<i class="fa-solid fa-circle-xmark text-error" style="color: #F43F5E;"></i>';
        }
    });

    gdriveInput.addEventListener('input', () => {
        const val = gdriveInput.value.trim();
        if (val.length === 0) {
            gdriveValidationMsg.classList.add('hidden');
            gdriveValidIcon.innerHTML = '';
            return;
        }

        if (isValidGDriveUrl(val)) {
            gdriveValidationMsg.classList.add('hidden');
            gdriveValidIcon.innerHTML = '<i class="fa-solid fa-circle-check text-success" style="color: #10B981;"></i>';
        } else {
            gdriveValidationMsg.classList.remove('hidden');
            gdriveValidIcon.innerHTML = '<i class="fa-solid fa-circle-xmark text-error" style="color: #F43F5E;"></i>';
        }
    });

    // =========================================================================
    // 7. CUSTOMIZATION ACCORDION & PRESET CHIPS
    // =========================================================================
    if (customAccordionBtn) {
        customAccordionBtn.addEventListener('click', () => {
            customAccordionBtn.classList.toggle('active');
            customAccordionBody.classList.toggle('hidden');
        });
    }

    // Color Pickers <-> Hex Input Sync
    fgColorInput.addEventListener('input', (e) => fgColorHex.value = e.target.value.toUpperCase());
    fgColorHex.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) fgColorInput.value = e.target.value;
    });

    bgColorInput.addEventListener('input', (e) => bgColorHex.value = e.target.value.toUpperCase());
    bgColorHex.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) bgColorInput.value = e.target.value;
    });

    // Slider display scale
    boxSizeSlider.addEventListener('input', (e) => {
        sliderValueDisplay.textContent = `${e.target.value}x (${e.target.value >= 12 ? '4K Ultra' : 'HD'})`;
    });

    // Preset chips
    presetChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const fg = chip.getAttribute('data-fg');
            const bg = chip.getAttribute('data-bg');

            fgColorInput.value = fg;
            fgColorHex.value = fg;
            bgColorInput.value = bg;
            bgColorHex.value = bg;

            showToast(`Applied preset: ${chip.textContent}`, 'info');
        });
    });

    // =========================================================================
    // 8. API GENERATION REQUEST ENGINE
    // =========================================================================
    generateBtn.addEventListener('click', async () => {
        if (state.isGenerating) return;

        const fg_color = fgColorInput.value;
        const bg_color = bgColorInput.value;
        const box_size = boxSizeSlider.value;
        const error_correction = eccSelect.value;

        let endpoint = '';
        let payload = null;

        // Build Payload according to active mode
        if (state.activeTab === 'text') {
            if (!state.selectedFile) {
                showToast('Please select or drop a .txt file first', 'error');
                return;
            }
            endpoint = '/api/generate/text-file';
            const formData = new FormData();
            formData.append('file', state.selectedFile);
            formData.append('fg_color', fg_color);
            formData.append('bg_color', bg_color);
            formData.append('box_size', box_size);
            formData.append('error_correction', error_correction);
            payload = formData;
        }
        else if (state.activeTab === 'url') {
            const urlVal = urlInput.value.trim();
            if (!urlVal) {
                showToast('Please enter a website URL', 'error');
                return;
            }
            endpoint = '/api/generate/url';
            payload = JSON.stringify({
                url: urlVal,
                fg_color,
                bg_color,
                box_size,
                error_correction
            });
        }
        else if (state.activeTab === 'gdrive') {
            const gdriveVal = gdriveInput.value.trim();
            if (!gdriveVal) {
                showToast('Please enter a Google Drive shareable link', 'error');
                return;
            }
            endpoint = '/api/generate/gdrive';
            payload = JSON.stringify({
                drive_url: gdriveVal,
                fg_color,
                bg_color,
                box_size,
                error_correction
            });
        }

        // Set Loading State
        setGeneratingState(true);

        try {
            const options = {
                method: 'POST',
                body: payload
            };
            if (state.activeTab !== 'text') {
                options.headers = { 'Content-Type': 'application/json' };
            }

            const response = await fetch(endpoint, options);
            const data = await response.json();

            if (data.success) {
                state.generatedData = data;
                renderResult(data);
                showToast('QR Code generated successfully!', 'success');
                triggerConfetti();
            } else {
                showToast(data.message || 'Failed to generate QR code', 'error');
            }
        } catch (error) {
            console.error('Generation API error:', error);
            showToast('Network error while generating QR code', 'error');
        } finally {
            setGeneratingState(false);
        }
    });

    const setGeneratingState = (isLoading) => {
        state.isGenerating = isLoading;
        if (isLoading) {
            btnText.classList.add('hidden');
            btnSpinner.classList.remove('hidden');
            generateBtn.disabled = true;
        } else {
            btnText.classList.remove('hidden');
            btnSpinner.classList.add('hidden');
            generateBtn.disabled = false;
        }
    };

    const renderResult = (data) => {
        resultSummaryText.textContent = data.summary || 'QR Code Asset';
        
        // Show Skeleton while loading image
        qrSkeleton.classList.remove('hidden');
        resultQrImg.classList.add('hidden');

        resultQrImg.src = data.data_url;
        resultQrImg.onload = () => {
            qrSkeleton.classList.add('hidden');
            resultQrImg.classList.remove('hidden');
        };

        // Toggle Copy URL button
        if (state.activeTab === 'url' || state.activeTab === 'gdrive') {
            copyLinkBtn.classList.remove('hidden');
        } else {
            copyLinkBtn.classList.add('hidden');
        }

        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // =========================================================================
    // 9. RESULT ACTION BUTTONS
    // =========================================================================
    downloadBtn.addEventListener('click', () => {
        if (!state.generatedData) return;
        
        const defaultName = `QRVerse_${state.activeTab.toUpperCase()}_${Date.now()}`;
        const userCustomName = prompt('Enter a name for your downloaded QR image:', defaultName) || defaultName;
        
        const downloadUrl = `${state.generatedData.download_url}?name=${encodeURIComponent(userCustomName)}`;
        
        const tempAnchor = document.createElement('a');
        tempAnchor.href = downloadUrl;
        tempAnchor.setAttribute('download', `${userCustomName}.png`);
        document.body.appendChild(tempAnchor);
        tempAnchor.click();
        document.body.removeChild(tempAnchor);

        showToast('Download started!', 'success');
    });

    copyImageBtn.addEventListener('click', async () => {
        if (!state.generatedData || !state.generatedData.data_url) return;

        try {
            // Convert base64 data_url to Blob
            const response = await fetch(state.generatedData.data_url);
            const blob = await response.blob();

            if (navigator.clipboard && window.ClipboardItem) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                showToast('QR Code image copied to clipboard!', 'success');
            } else {
                showToast('Clipboard image copying not supported on this browser', 'info');
            }
        } catch (err) {
            console.error('Failed to copy image to clipboard:', err);
            showToast('Unable to copy image directly to clipboard', 'error');
        }
    });

    copyLinkBtn.addEventListener('click', () => {
        if (!state.generatedData || !state.generatedData.encoded_url) return;
        navigator.clipboard.writeText(state.generatedData.encoded_url);
        showToast('Encoded URL copied to clipboard!', 'success');
    });

    resetBtn.addEventListener('click', () => {
        resultSection.classList.add('hidden');
        if (state.activeTab === 'text') clearSelectedFile();
        if (state.activeTab === 'url') {
            urlInput.value = '';
            urlValidIcon.innerHTML = '';
        }
        if (state.activeTab === 'gdrive') {
            gdriveInput.value = '';
            gdriveValidIcon.innerHTML = '';
        }
        window.scrollTo({ top: document.getElementById('generator').offsetTop - 100, behavior: 'smooth' });
    });

    // =========================================================================
    // 10. FAQ ACCORDION
    // =========================================================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // =========================================================================
    // 11. KEYBOARD SHORTCUTS
    // =========================================================================
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateBtn.click();
        }
        if (e.key === 'Escape') {
            if (!resultSection.classList.contains('hidden')) {
                resetBtn.click();
            }
        }
    });

    // =========================================================================
    // 12. CONFETTI ANIMATION ENGINE
    // =========================================================================
    function triggerConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const pieces = [];
        const numberOfPieces = 100;
        const colors = ['#6C63FF', '#8A5CFF', '#00D4FF', '#10B981', '#FFBD2E', '#FFFFFF'];

        for (let i = 0; i < numberOfPieces; i++) {
            pieces.push({
                x: canvas.width / 2,
                y: canvas.height / 2 + 50,
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.8) * 18,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                opacity: 1
            });
        }

        let frame = 0;
        function renderConfetti() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let activePieces = 0;

            pieces.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.4; // Gravity
                p.rotation += p.rotationSpeed;
                p.opacity -= 0.015;

                if (p.opacity > 0) {
                    activePieces++;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rotation * Math.PI) / 180);
                    ctx.globalAlpha = Math.max(0, p.opacity);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                    ctx.restore();
                }
            });

            frame++;
            if (activePieces > 0 && frame < 120) {
                requestAnimationFrame(renderConfetti);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        renderConfetti();
    }

    // =========================================================================
    // 13. TOAST NOTIFICATION SYSTEM
    // =========================================================================
    function showToast(message, type = 'info') {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let iconClass = 'fa-solid fa-circle-info';
        if (type === 'success') iconClass = 'fa-solid fa-circle-check';
        if (type === 'error') iconClass = 'fa-solid fa-circle-xmark';

        toast.innerHTML = `
            <i class="${iconClass}"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-100%)';
            toast.style.transition = 'all 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 3500);
    }

    // Helper: Format Bytes
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

});
