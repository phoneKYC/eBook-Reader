/* ============================================================
   IIDZII Reader - Main Application
   ============================================================ */

(function() {
  'use strict';

  // ---- i18n Translations ----
  const translations = {
    ar: {
      reader: 'القارئ',
      continue_reading: 'متابعة القراءة',
      upload_title: 'اسحب الكتاب هنا',
      upload_subtitle: 'أو انقر لاختيار ملف',
      suggested_reading: 'مقترحات للقراءة',
      footer_tag: 'قارئ الكتب الإلكترونية',
      back: 'رجوع',
      search: 'بحث',
      toc: 'الفهرس',
      bookmarks: 'الإشارات',
      bookmark: 'إشارة',
      font_settings: 'إعدادات الخط',
      focus_mode: 'وضع التركيز',
      paginated: 'صفحات',
      continuous: 'مستمر',
      reading_mode: 'وضع القراءة',
      line_height: 'ارتفاع السطر',
      search_placeholder: 'ابحث في الكتاب...',
      no_results: 'لا توجد نتائج',
      no_bookmarks: 'لا توجد إشارات مرجعية',
      no_toc: 'لا يوجد فهرس متاح',
      page: 'صفحة',
      chapter: 'فصل',
      of: 'من',
      added_bookmark: 'تمت إضافة إشارة',
      removed_bookmark: 'تمت إزالة الإشارة',
      file_not_supported: 'صيغة الملف غير مدعومة',
      error_loading: 'خطأ في تحميل الملف',
      loading: 'جارٍ التحميل...',
      genre_fantasy: 'خيال',
      genre_cyberpunk: 'سايبربانك',
      genre_sci_fi: 'خيال علمي',
      genre_fiction: 'رواية',
      genre_nonfiction: 'واقعي',
      my_library: 'مكتبتي',
      added_to_library: 'تمت الإضافة للمكتبة',
      removed_from_library: 'تمت الإزالة من المكتبة',
      format_txt: 'نص',
      format_pdf: 'PDF',
      format_docx: 'DOCX',
      format_epub: 'EPUB'
    },
    en: {
      reader: 'Reader',
      continue_reading: 'Continue Reading',
      upload_title: 'Drop your book here',
      upload_subtitle: 'or click to browse',
      suggested_reading: 'Suggested Reading',
      footer_tag: 'E-Book Reader',
      back: 'Back',
      search: 'Search',
      toc: 'Contents',
      bookmarks: 'Bookmarks',
      bookmark: 'Bookmark',
      font_settings: 'Font Settings',
      focus_mode: 'Focus Mode',
      paginated: 'Paginated',
      continuous: 'Continuous',
      reading_mode: 'Reading Mode',
      line_height: 'Line Height',
      search_placeholder: 'Search in book...',
      no_results: 'No results found',
      no_bookmarks: 'No bookmarks yet',
      no_toc: 'No table of contents available',
      page: 'Page',
      chapter: 'Chapter',
      of: 'of',
      added_bookmark: 'Bookmark added',
      removed_bookmark: 'Bookmark removed',
      file_not_supported: 'File format not supported',
      error_loading: 'Error loading file',
      loading: 'Loading...',
      genre_fantasy: 'Fantasy',
      genre_cyberpunk: 'Cyberpunk',
      genre_sci_fi: 'Sci-Fi',
      genre_fiction: 'Fiction',
      genre_nonfiction: 'Non-Fiction',
      my_library: 'My Library',
      added_to_library: 'Added to library',
      removed_from_library: 'Removed from library',
      format_txt: 'TXT',
      format_pdf: 'PDF',
      format_docx: 'DOCX',
      format_epub: 'EPUB'
    }
  };

  // ---- App State ----
  const state = {
    lang: 'ar',
    theme: 'dark',
    currentBook: null,
    currentFormat: null,
    pdfDoc: null,
    pdfPage: 1,
    pdfTotalPages: 0,
    pdfScale: 1.2,
    bookChapters: [],
    currentPage: 0,
    totalPages: 0,
    readingMode: 'paginated',
    fontSize: 18,
    lineHeight: 1.8,
    focusMode: false,
    toolbarTimeout: null,
    toolbarVisible: true,
    bookmarks: [],
    tocItems: [],
    lastScrollPos: 0
  };

  // ---- IndexedDB ----
  const DB_NAME = 'IIDZIIReaderDB';
  const DB_VERSION = 2;

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('books')) {
          db.createObjectStore('books', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('progress')) {
          const store = db.createObjectStore('progress', { keyPath: 'bookId' });
          store.createIndex('lastRead', 'lastRead');
        }
        if (!db.objectStoreNames.contains('bookmarks')) {
          db.createObjectStore('bookmarks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'bookId' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function dbPut(storeName, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(data);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function dbGet(storeName, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const request = tx.objectStore(storeName).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function dbGetAll(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const request = tx.objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function dbDelete(storeName, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // ---- Settings Persistence ----
  async function saveSettings() {
    await dbPut('settings', { key: 'appSettings', lang: state.lang, theme: state.theme, fontSize: state.fontSize, lineHeight: state.lineHeight, readingMode: state.readingMode });
  }

  async function loadSettings() {
    const s = await dbGet('settings', 'appSettings');
    if (s) {
      state.lang = s.lang || 'ar';
      state.theme = s.theme || 'dark';
      state.fontSize = s.fontSize || 18;
      state.lineHeight = s.lineHeight || 1.8;
      state.readingMode = s.readingMode || 'paginated';
    }
  }

  // ---- i18n ----
  function t(key) {
    return (translations[state.lang] && translations[state.lang][key]) || key;
  }

  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = t(key);
      el.setAttribute('aria-label', t(key));
    });
    // Update lang buttons
    const otherLang = state.lang === 'ar' ? 'EN' : 'عربي';
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.textContent = otherLang;
    });
  }

  function setLanguage(lang) {
    state.lang = lang;
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    applyI18n();
    saveSettings();
  }

  // ---- Theme ----
  function setTheme(theme) {
    state.theme = theme;
    document.body.setAttribute('data-theme', theme);
    saveSettings();
  }

  function cycleTheme() {
    const themes = ['light', 'dark', 'amoled'];
    const idx = themes.indexOf(state.theme);
    setTheme(themes[(idx + 1) % themes.length]);
  }

  // ---- DOM References ----
  const $ = (id) => document.getElementById(id);

  // ---- Toast System ----
  function showToast(text, className = '') {
    const container = $('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast ' + className;
    toast.textContent = text;
    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 2500);
  }

  function showPageToast(current, total) {
    const text = `${current} ${t('of')} ${total}`;
    showToast(text, 'toast-page');
  }

  function showChapterToast(title) {
    showToast(title, 'toast-chapter');
  }

  // ---- Progress Bar ----
  function updateProgress(current, total) {
    const pct = total > 0 ? (current / total) * 100 : 0;
    $('progress-bar').style.width = pct + '%';
  }

  // ---- Toolbar Auto-Hide ----
  function showToolbar() {
    const toolbar = $('toolbar');
    toolbar.classList.remove('hidden-toolbar');
    state.toolbarVisible = true;
    resetToolbarTimer();
  }

  function hideToolbar() {
    if (state.currentFormat === 'pdf') return; // Always show for PDF
    const toolbar = $('toolbar');
    toolbar.classList.add('hidden-toolbar');
    state.toolbarVisible = false;
  }

  function resetToolbarTimer() {
    clearTimeout(state.toolbarTimeout);
    state.toolbarTimeout = setTimeout(() => {
      hideToolbar();
    }, 5000);
  }

  // ---- File Handling ----
  function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  async function handleFile(file) {
    const ext = getFileExtension(file.name);
    if (!['txt', 'pdf', 'docx', 'epub'].includes(ext)) {
      showToast(t('file_not_supported'));
      return;
    }

    const bookId = 'book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    state.currentBook = {
      id: bookId,
      title: file.name.replace(/\.[^.]+$/, ''),
      format: ext,
      lastRead: Date.now(),
      coverColor: getAccentForFormat(ext)
    };
    state.currentFormat = ext;

    try {
      // Store the file blob in IndexedDB for "continue reading"
      const arrayBuffer = await file.arrayBuffer();
      await dbPut('files', { bookId: bookId, blob: arrayBuffer, name: file.name, type: ext });

      switch (ext) {
        case 'pdf':
          await loadPDFFromArrayBuffer(arrayBuffer);
          break;
        case 'docx':
          await loadDOCXFromArrayBuffer(arrayBuffer);
          break;
        case 'epub':
          await loadEPUBFromArrayBuffer(arrayBuffer);
          break;
        case 'txt':
          const text = new TextDecoder().decode(arrayBuffer);
          displayBookContent(txtToHtml(text));
          break;
      }

      // Save book metadata
      if (state.totalPages > 0) {
        state.currentBook.totalPages = state.totalPages;
      } else if (state.pdfTotalPages > 0) {
        state.currentBook.totalPages = state.pdfTotalPages;
      }
      await dbPut('books', state.currentBook);

      showReaderScreen();
    } catch (err) {
      console.error('Error loading file:', err);
      showToast(t('error_loading'));
    }
  }

  function getAccentForFormat(ext) {
    const colors = { txt: '#00897B', pdf: '#D32F2F', docx: '#1565C0', epub: '#6A1B9A' };
    return colors[ext] || '#00897B';
  }

  // ---- PDF Loading & Rendering ----
  async function loadPDFFromArrayBuffer(arrayBuffer) {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    state.pdfDoc = await loadingTask.promise;
    state.pdfTotalPages = state.pdfDoc.numPages;
    state.pdfPage = 1;
    state.pdfScale = 1.2;
    renderPDFPage(state.pdfPage);
  }

  async function loadPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    await loadPDFFromArrayBuffer(arrayBuffer);
  }

  async function renderPDFPage(pageNum) {
    if (!state.pdfDoc) return;
    pageNum = Math.max(1, Math.min(pageNum, state.pdfTotalPages));
    state.pdfPage = pageNum;

    const page = await state.pdfDoc.getPage(pageNum);
    const canvas = $('pdf-canvas');
    const ctx = canvas.getContext('2d');

    const viewport = page.getViewport({ scale: state.pdfScale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport: viewport }).promise;

    // Update UI
    $('pdf-page-info').textContent = `${pageNum} ${t('of')} ${state.pdfTotalPages}`;
    $('pdf-zoom-level').textContent = Math.round(state.pdfScale * 100) + '%';
    $('pdf-prev').disabled = pageNum <= 1;
    $('pdf-next').disabled = pageNum >= state.pdfTotalPages;

    updateProgress(pageNum, state.pdfTotalPages);
    saveProgressDebounced();
  }

  // ---- DOCX Loading ----
  async function loadDOCX(file) {
    const arrayBuffer = await file.arrayBuffer();
    await loadDOCXFromArrayBuffer(arrayBuffer);
  }

  async function loadDOCXFromArrayBuffer(arrayBuffer) {
    const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
    displayBookContent(result.value);
  }

  // ---- EPUB Loading ----
  async function loadEPUB(file) {
    const arrayBuffer = await file.arrayBuffer();
    await loadEPUBFromArrayBuffer(arrayBuffer);
  }

  async function loadEPUBFromArrayBuffer(arrayBuffer) {
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Find and parse container.xml
    const containerXml = await zip.file('META-INF/container.xml')?.async('text');
    if (!containerXml) throw new Error('Invalid EPUB: no container.xml');

    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerXml, 'application/xml');
    const rootfilePath = containerDoc.querySelector('rootfile')?.getAttribute('full-path');
    if (!rootfilePath) throw new Error('Invalid EPUB: no rootfile');

    // Parse OPF
    const opfContent = await zip.file(rootfilePath)?.async('text');
    if (!opfContent) throw new Error('Invalid EPUB: cannot read OPF');

    const opfDoc = parser.parseFromString(opfContent, 'application/xml');

    // Get spine order
    const spineItems = Array.from(opfDoc.querySelectorAll('spine itemref'));
    const manifest = {};
    opfDoc.querySelectorAll('manifest item').forEach(item => {
      manifest[item.getAttribute('id')] = item.getAttribute('href');
    });

    const opfDir = rootfilePath.includes('/') ? rootfilePath.substring(0, rootfilePath.lastIndexOf('/') + 1) : '';

    // Read chapters in spine order
    let htmlContent = '';
    for (const item of spineItems) {
      const idref = item.getAttribute('idref');
      const href = manifest[idref];
      if (!href) continue;

      const fullPath = opfDir + href;
      const content = await zip.file(fullPath)?.async('text');
      if (!content) continue;

      const contentDoc = parser.parseFromString(content, 'application/xhtml+xml');
      const body = contentDoc.querySelector('body');
      if (body) {
        htmlContent += body.innerHTML + '\n';
      }
    }

    displayBookContent(htmlContent);
  }

  // ---- TXT Loading ----
  async function loadTXT(file) {
    const text = await file.text();
    displayBookContent(txtToHtml(text));
  }

  function txtToHtml(text) {
    const lines = text.split('\n');
    let html = '';
    let inParagraph = false;
    let isFirstContent = true;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // Skip decorative separator lines (━━━ or --- or ***)
      if (/^[━─\-_*]{5,}$/.test(line)) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        continue;
      }

      // Skip "end of excerpt" / copyright lines at the end
      if (/^(نهاية المقتطف|END OF EXCERPT|هذا مقتطف|This is an excerpt|جميع الحقوق|All rights reserved|تأليف IIDZII|by IIDZII)$/i.test(line)) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        continue;
      }

      // Detect headings
      // Format: === Title === or ### Title or ## Title
      if (/^={3,}\s*.+\s*={3,}$/.test(line)) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        const title = line.replace(/^={3,}\s*/, '').replace(/\s*={3,}$/, '').trim();
        html += `<h2>${escapeHtml(title)}</h2>`;
        continue;
      }
      if (/^##\s+.+/.test(line)) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        const title = line.replace(/^##\s+/, '').trim();
        html += `<h2>${escapeHtml(title)}</h2>`;
        continue;
      }
      if (/^###\s+.+/.test(line)) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        const title = line.replace(/^###\s+/, '').trim();
        html += `<h3>${escapeHtml(title)}</h3>`;
        continue;
      }

      // Empty line = paragraph break
      if (line === '') {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        continue;
      }

      // First non-empty content line → book title (h1)
      if (isFirstContent) {
        html += `<h1>${escapeHtml(line)}</h1>`;
        isFirstContent = false;
        continue;
      }

      // "تأليف:" or "by" lines → author line
      if (/^(تأليف|by)\s*:/i.test(line) || /^(تأليف|by)\s+/i.test(line)) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        html += `<h3 class="author-line">${escapeHtml(line)}</h3>`;
        continue;
      }

      // Regular text
      if (!inParagraph) {
        html += '<p>';
        inParagraph = true;
      } else {
        html += ' ';
      }
      html += escapeHtml(line);
    }

    if (inParagraph) html += '</p>';
    return html;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ---- Display Book Content (TXT/DOCX/EPUB) ----
  function displayBookContent(html) {
    const contentEl = $('book-content');
    contentEl.innerHTML = html;

    // Apply font settings
    contentEl.style.fontSize = state.fontSize + 'px';
    contentEl.style.lineHeight = state.lineHeight;

    // Build TOC
    buildTOC(contentEl);

    // Setup reading mode
    if (state.readingMode === 'paginated') {
      setupPaginatedMode(contentEl);
    } else {
      setupContinuousMode(contentEl);
    }
  }

  // ---- TOC Building ----
  function buildTOC(contentEl) {
    state.tocItems = [];
    const headings = contentEl.querySelectorAll('h1, h2, h3');

    headings.forEach((heading, index) => {
      const id = 'heading-' + index;
      heading.id = id;
      state.tocItems.push({
        id: id,
        text: heading.textContent,
        level: parseInt(heading.tagName.charAt(1)),
        element: heading
      });

      // Add chapter divider before h2 headings
      if (heading.tagName === 'H2' && index > 0) {
        const divider = document.createElement('div');
        divider.className = 'chapter-divider';
        divider.textContent = heading.textContent;
        heading.parentNode.insertBefore(divider, heading);
      }
    });

    renderTOC();
  }

  function renderTOC() {
    const tocList = $('toc-list');
    tocList.innerHTML = '';

    if (state.tocItems.length === 0) {
      tocList.innerHTML = `<div class="no-items-msg">${t('no_toc')}</div>`;
      return;
    }

    state.tocItems.forEach(item => {
      const div = document.createElement('div');
      div.className = 'toc-item';
      div.innerHTML = `
        <span class="toc-level">H${item.level}</span>
        <span class="toc-text">${item.text}</span>
      `;
      div.addEventListener('click', () => {
        navigateToHeading(item.id);
        closeSidebar();
      });
      tocList.appendChild(div);
    });
  }

  function navigateToHeading(id) {
    const el = document.getElementById(id);
    if (!el) return;

    if (state.readingMode === 'paginated') {
      // Find which page this heading is on
      const pageIdx = findPageForElement(el);
      if (pageIdx >= 0) {
        goToPage(pageIdx);
      }
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showChapterToast(el.textContent);
  }

  function findPageForElement(el) {
    if (!state.pageBreaks || state.pageBreaks.length === 0) return 0;
    const elTop = el.offsetTop;
    for (let i = state.pageBreaks.length - 1; i >= 0; i--) {
      if (state.pageBreaks[i] <= elTop) return i;
    }
    return 0;
  }

  // ---- Paginated Mode ----
  let pageContentCache = [];

  function setupPaginatedMode(contentEl) {
    const viewer = $('book-viewer');
    viewer.style.overflow = 'hidden';
    
    // Restore page nav elements hidden by continuous mode
    $('page-prev').classList.remove('hidden');
    $('page-next').classList.remove('hidden');
    $('page-indicator').classList.remove('hidden');
    $('page-nav').classList.remove('hidden', 'continuous-nav');

    // Calculate page breaks based on viewer height
    const viewerHeight = viewer.clientHeight;
    const contentHeight = contentEl.scrollHeight;

    state.pageBreaks = [0];
    let pos = 0;

    while (pos + viewerHeight < contentHeight) {
      pos += viewerHeight;
      state.pageBreaks.push(pos);
    }

    state.totalPages = state.pageBreaks.length;
    state.currentPage = Math.min(state.currentPage, state.totalPages - 1);

    goToPage(state.currentPage);
  }

  function goToPage(pageIdx) {
    pageIdx = Math.max(0, Math.min(pageIdx, state.totalPages - 1));
    state.currentPage = pageIdx;

    const contentEl = $('book-content');
    const viewer = $('book-viewer');

    if (state.pageBreaks && state.pageBreaks[pageIdx] !== undefined) {
      viewer.scrollTop = state.pageBreaks[pageIdx];
    }

    // Update page indicator
    $('page-indicator').textContent = `${pageIdx + 1} ${t('of')} ${state.totalPages}`;
    updateProgress(pageIdx + 1, state.totalPages);

    // Check if we crossed a chapter heading
    checkChapterChange(pageIdx);

    // Page turn animation
    const content = $('book-content');
    content.classList.remove('page-turn-left', 'page-turn-right');
    void content.offsetWidth; // force reflow
    // Direction based on RTL
    content.classList.add(state.lang === 'ar' ? 'page-turn-right' : 'page-turn-left');

    saveProgressDebounced();
  }

  function checkChapterChange(pageIdx) {
    if (!state.pageBreaks || !state.tocItems.length) return;
    const scrollTop = state.pageBreaks[pageIdx] || 0;

    for (const item of state.tocItems) {
      const elTop = item.element.offsetTop;
      if (elTop >= scrollTop && elTop < scrollTop + ($('book-viewer').clientHeight || 600)) {
        if (item.text !== state._lastChapterToast) {
          showChapterToast(item.text);
          state._lastChapterToast = item.text;
        }
        break;
      }
    }
  }

  // ---- Continuous Mode ----
  function setupContinuousMode(contentEl) {
    const viewer = $('book-viewer');
    viewer.style.overflow = 'auto';
    $('page-prev').classList.add('hidden');
    $('page-next').classList.add('hidden');
    $('page-indicator').classList.add('hidden');

    // Scroll listener for progress
    viewer.onscroll = () => {
      const scrollTop = viewer.scrollTop;
      const scrollHeight = viewer.scrollHeight - viewer.clientHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      updateProgress(progress * 100, 100);
      resetToolbarTimer();
      state.lastScrollPos = scrollTop;
      saveProgressDebounced();
    };
  }

  // ---- Save/Load Progress ----
  let _saveProgressTimer = null;

  function saveProgressDebounced() {
    clearTimeout(_saveProgressTimer);
    _saveProgressTimer = setTimeout(saveProgress, 500);
  }

  async function saveProgress() {
    if (!state.currentBook) return;
    const data = {
      bookId: state.currentBook.id,
      page: state.currentFormat === 'pdf' ? state.pdfPage : state.currentPage,
      scrollPos: state.lastScrollPos,
      lastRead: Date.now()
    };
    try {
      await dbPut('progress', data);
    } catch(e) {
      console.warn('Failed to save progress:', e);
    }
  }

  async function loadContinueReading() {
    try {
      const allProgress = await dbGetAll('progress');
      if (!allProgress.length) return;

      allProgress.sort((a, b) => b.lastRead - a.lastRead);
      const latest = allProgress[0];

      const book = await dbGet('books', latest.bookId);
      if (!book) return;

      const el = $('continue-reading');
      el.classList.remove('hidden');
      $('continue-title').textContent = book.title;
      $('continue-page').textContent = `${t('page')} ${latest.page || 1}`;
      $('continue-cover').style.background = book.coverColor || 'var(--accent)';

      // Progress bar estimate
      const progress = book.totalPages ? (latest.page / book.totalPages) * 100 : 30;
      $('continue-bar-fill').style.width = progress + '%';

      // Click to continue
      $('continue-card').onclick = async () => {
        if (book.isSuggestion) {
          loadSuggestionBook(book.suggestionId, latest.page);
        } else {
          // For uploaded files, reload from stored blob
          try {
            const stored = await dbGet('files', latest.bookId);
            if (stored && stored.blob) {
              state.currentBook = book;
              state.currentFormat = stored.type;
              state.currentPage = latest.page || 0;
              state.pdfPage = latest.page || 1;

              switch (stored.type) {
                case 'pdf':
                  await loadPDFFromArrayBuffer(stored.blob);
                  renderPDFPage(state.pdfPage);
                  break;
                case 'docx':
                  await loadDOCXFromArrayBuffer(stored.blob);
                  if (state.readingMode === 'paginated' && state.currentPage > 0) {
                    goToPage(state.currentPage);
                  }
                  break;
                case 'epub':
                  await loadEPUBFromArrayBuffer(stored.blob);
                  if (state.readingMode === 'paginated' && state.currentPage > 0) {
                    goToPage(state.currentPage);
                  }
                  break;
                case 'txt':
                  const text = new TextDecoder().decode(stored.blob);
                  displayBookContent(txtToHtml(text));
                  if (state.readingMode === 'paginated' && state.currentPage > 0) {
                    goToPage(state.currentPage);
                  }
                  break;
              }
              showReaderScreen();
            } else {
              showToast(t('error_loading'));
            }
          } catch (e) {
            console.error('Error reloading book:', e);
            showToast(t('error_loading'));
          }
        }
      };
    } catch (e) {
      console.error('Error loading continue reading:', e);
    }
  }

  // ---- Bookmarks ----
  async function loadBookmarks() {
    if (!state.currentBook) return;
    const all = await dbGetAll('bookmarks');
    state.bookmarks = all.filter(b => b.bookId === state.currentBook.id);
    renderBookmarks();
  }

  function renderBookmarks() {
    const list = $('bookmarks-list');
    list.innerHTML = '';

    if (state.bookmarks.length === 0) {
      list.innerHTML = `<div class="no-items-msg">${t('no_bookmarks')}</div>`;
      return;
    }

    state.bookmarks.forEach(bm => {
      const div = document.createElement('div');
      div.className = 'bookmark-item';
      div.innerHTML = `
        <span class="bookmark-icon">&#9733;</span>
        <div class="bookmark-info">
          <div class="bookmark-page">${t('page')} ${bm.page}</div>
          <div class="bookmark-text">${bm.text || ''}</div>
        </div>
        <span class="bookmark-delete" data-id="${bm.id}">&times;</span>
      `;
      div.querySelector('.bookmark-delete').addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = e.target.getAttribute('data-id');
        await dbDelete('bookmarks', id);
        state.bookmarks = state.bookmarks.filter(b => b.id !== id);
        renderBookmarks();
        showToast(t('removed_bookmark'));
        updateBookmarkButton();
      });
      div.addEventListener('click', () => {
        if (state.currentFormat === 'pdf') {
          renderPDFPage(bm.page);
        } else {
          goToPage(bm.page - 1);
        }
        closeSidebar();
      });
      list.appendChild(div);
    });
  }

  async function toggleBookmark() {
    if (!state.currentBook) return;
    const page = state.currentFormat === 'pdf' ? state.pdfPage : state.currentPage + 1;
    const existing = state.bookmarks.find(b => b.page === page);

    if (existing) {
      await dbDelete('bookmarks', existing.id);
      state.bookmarks = state.bookmarks.filter(b => b.id !== existing.id);
      showToast(t('removed_bookmark'));
    } else {
      // Get nearby text for bookmark description
      let text = '';
      if (state.currentFormat !== 'pdf') {
        const paragraphs = $('book-content').querySelectorAll('p');
        for (const p of paragraphs) {
          if (p.textContent.trim().length > 20) {
            text = p.textContent.trim().substring(0, 60) + '...';
            break;
          }
        }
      }

      const bm = {
        id: 'bm_' + Date.now(),
        bookId: state.currentBook.id,
        page: page,
        text: text,
        created: Date.now()
      };
      await dbPut('bookmarks', bm);
      state.bookmarks.push(bm);
      showToast(t('added_bookmark'));
    }

    updateBookmarkButton();
    renderBookmarks();
  }

  function updateBookmarkButton() {
    const page = state.currentFormat === 'pdf' ? state.pdfPage : state.currentPage + 1;
    const isBookmarked = state.bookmarks.some(b => b.page === page);
    const btn = $('bookmark-btn');
    if (isBookmarked) {
      btn.style.color = 'var(--warning)';
      btn.style.borderColor = 'var(--warning)';
    } else {
      btn.style.color = '';
      btn.style.borderColor = '';
    }
  }

  // ---- Search ----
  function openSearch() {
    $('search-panel').classList.remove('hidden');
    $('search-input').focus();
  }

  function closeSearch() {
    $('search-panel').classList.add('hidden');
    $('search-input').value = '';
    $('search-results').innerHTML = '';
    // Remove highlights
    $('book-content').querySelectorAll('.search-highlight').forEach(el => {
      const parent = el.parentNode;
      parent.replaceChild(document.createTextNode(el.textContent), el);
      parent.normalize();
    });
  }

  function performSearch(query) {
    if (!query || query.length < 2) {
      $('search-results').innerHTML = '';
      return;
    }

    const results = [];
    if (state.currentFormat === 'pdf') {
      $('search-results').innerHTML = `<div class="no-items-msg">${t('no_results')} (PDF)</div>`;
      return;
    }

    const content = $('book-content');
    const paragraphs = content.querySelectorAll('p, h1, h2, h3');

    paragraphs.forEach(p => {
      const text = p.textContent;
      const lowerText = text.toLowerCase();
      const lowerQuery = query.toLowerCase();
      const idx = lowerText.indexOf(lowerQuery);

      if (idx >= 0) {
        const snippet = text.substring(Math.max(0, idx - 30), Math.min(text.length, idx + query.length + 30));
        results.push({ element: p, snippet, query });
      }
    });

    const resultsDiv = $('search-results');
    if (results.length === 0) {
      resultsDiv.innerHTML = `<div class="no-items-msg">${t('no_results')}</div>`;
      return;
    }

    resultsDiv.innerHTML = '';
    results.forEach((r, i) => {
      const div = document.createElement('div');
      div.className = 'search-result-item';
      const highlighted = r.snippet.replace(
        new RegExp(escapeRegex(r.query), 'gi'),
        match => `<span class="search-highlight">${match}</span>`
      );
      div.innerHTML = `...${highlighted}...`;
      div.addEventListener('click', () => {
        if (state.readingMode === 'paginated') {
          const pageIdx = findPageForElement(r.element);
          goToPage(pageIdx);
        } else {
          r.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        closeSearch();
      });
      resultsDiv.appendChild(div);
    });
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ---- Focus Mode ----
  function toggleFocusMode() {
    state.focusMode = !state.focusMode;
    const content = $('book-content');
    const btn = $('focus-btn');

    if (state.focusMode) {
      content.classList.add('focus-mode');
      btn.style.background = 'var(--accent)';
      btn.style.color = 'var(--bg)';
      btn.style.borderColor = 'var(--accent)';

      // Add hover/focus listeners to paragraphs
      content.querySelectorAll('p').forEach(p => {
        p.addEventListener('mouseenter', focusParagraph);
        p.addEventListener('mouseleave', unfocusParagraph);
      });
    } else {
      content.classList.remove('focus-mode');
      btn.style.background = '';
      btn.style.color = '';
      btn.style.borderColor = '';

      content.querySelectorAll('p').forEach(p => {
        p.removeEventListener('mouseenter', focusParagraph);
        p.removeEventListener('mouseleave', unfocusParagraph);
        p.classList.remove('focused');
      });
    }
  }

  function focusParagraph(e) {
    e.target.classList.add('focused');
  }

  function unfocusParagraph(e) {
    e.target.classList.remove('focused');
  }

  // ---- Suggestions & Library ----
  let _manifestBooks = [];
  let _libraryBooks = [];
  let _discoveredBooks = [];

  async function loadSuggestions() {
    // 1. Load manifest books
    try {
      const resp = await fetch('suggestions/manifest.json');
      const manifest = await resp.json();
      _manifestBooks = manifest.books || [];
    } catch (e) {
      console.warn('Error loading manifest:', e);
      _manifestBooks = [];
    }

    // 2. Auto-discover new files in suggestions folder
    _discoveredBooks = await discoverSuggestionFiles(_manifestBooks);

    // 3. Load user library from IndexedDB
    try {
      const allBooks = await dbGetAll('books');
      _libraryBooks = allBooks.filter(b => !b.isSuggestion);
    } catch (e) {
      _libraryBooks = [];
    }

    renderAllBooks();
  }

  async function discoverSuggestionFiles(existingBooks) {
    const discovered = [];
    const existingFiles = new Set(existingBooks.map(b => b.file));
    const dirs = ['ar', 'en'];

    for (const dir of dirs) {
      // Try common file patterns
      const commonNames = [
        'book1', 'book2', 'book3', 'book4', 'book5',
        'story1', 'story2', 'story3',
        'chapter1', 'chapter2',
        'sample', 'excerpt', 'preview'
      ];

      for (const name of commonNames) {
        for (const ext of ['txt']) {
          const filePath = `${dir}/${name}.${ext}`;
          if (existingFiles.has(filePath)) continue;

          try {
            const resp = await fetch('suggestions/' + filePath, { method: 'HEAD' });
            if (resp.ok) {
              discovered.push({
                id: `discovered_${dir}_${name}`,
                title: dir === 'ar' ? name.replace(/_/g, ' ') : name.replace(/_/g, ' '),
                titleEn: name.replace(/_/g, ' '),
                author: 'IIDZII',
                lang: dir,
                genre: dir === 'ar' ? 'fiction' : 'fiction',
                file: filePath,
                description: '',
                descriptionEn: '',
                cover_color: '#607D8B',
                _discovered: true
              });
              existingFiles.add(filePath);
            }
          } catch (e) {
            // File doesn't exist, skip
          }
        }
      }

      // Also try numbered files up to 20
      for (let i = 1; i <= 20; i++) {
        const filePath = `${dir}/${i}.txt`;
        if (existingFiles.has(filePath)) continue;

        try {
          const resp = await fetch('suggestions/' + filePath, { method: 'HEAD' });
          if (resp.ok) {
            discovered.push({
              id: `discovered_${dir}_${i}`,
              title: dir === 'ar' ? `كتاب ${i}` : `Book ${i}`,
              titleEn: `Book ${i}`,
              author: 'IIDZII',
              lang: dir,
              genre: 'fiction',
              file: filePath,
              description: '',
              descriptionEn: '',
              cover_color: '#607D8B',
              _discovered: true
            });
            existingFiles.add(filePath);
          }
        } catch (e) {
          // File doesn't exist, skip
        }
      }
    }

    return discovered;
  }

  function renderAllBooks() {
    const grid = $('suggestions-grid');
    grid.innerHTML = '';

    // Render manifest + discovered suggestions
    const allSuggestions = [..._manifestBooks, ..._discoveredBooks];
    allSuggestions.forEach(book => {
      const card = createSuggestionCard(book);
      grid.appendChild(card);
    });

    // Render library books (if any)
    if (_libraryBooks.length > 0) {
      const libraryDivider = document.createElement('div');
      libraryDivider.className = 'library-divider';
      libraryDivider.innerHTML = `<span data-i18n="my_library">${t('my_library')}</span>`;
      grid.appendChild(libraryDivider);

      _libraryBooks.forEach(book => {
        const card = createLibraryCard(book);
        grid.appendChild(card);
      });
    }
  }

  function createSuggestionCard(book) {
    const title = state.lang === 'ar' && book.title ? book.title : (book.titleEn || book.title);
    const desc = state.lang === 'ar' ? (book.description || book.descriptionEn) : (book.descriptionEn || book.description);
    const genreKey = 'genre_' + book.genre.replace('-', '_');
    const genreText = t(genreKey) || book.genre;

    const card = document.createElement('div');
    card.className = 'suggestion-card';
    card.innerHTML = `
      <div class="suggestion-cover" style="background:${book.cover_color || '#607D8B'}"></div>
      <div class="suggestion-title">${title}</div>
      <div class="suggestion-author">${book.author || ''}</div>
      ${desc ? `<div class="suggestion-desc">${desc}</div>` : ''}
      ${genreText ? `<div class="suggestion-genre">${genreText}</div>` : ''}
    `;
    card.addEventListener('click', () => loadSuggestionBook(book.id));
    return card;
  }

  function createLibraryCard(book) {
    const formatKey = 'format_' + (book.format || 'txt');
    const formatText = t(formatKey) || (book.format || '').toUpperCase();

    const card = document.createElement('div');
    card.className = 'suggestion-card library-card';
    card.innerHTML = `
      <button class="library-delete" data-id="${book.id}" aria-label="Remove from library">&times;</button>
      <div class="suggestion-cover" style="background:${book.coverColor || '#607D8B'}"></div>
      <div class="suggestion-title">${book.title || ''}</div>
      <div class="library-badge">${formatText}</div>
    `;

    // Delete button
    card.querySelector('.library-delete').addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = e.target.getAttribute('data-id');
      await deleteLibraryBook(id);
    });

    // Click to open
    card.addEventListener('click', async () => {
      await openLibraryBook(book.id);
    });

    return card;
  }

  async function deleteLibraryBook(bookId) {
    try {
      await dbDelete('books', bookId);
      await dbDelete('files', bookId);
      // Also delete related bookmarks and progress
      const allBookmarks = await dbGetAll('bookmarks');
      for (const bm of allBookmarks) {
        if (bm.bookId === bookId) await dbDelete('bookmarks', bm.id);
      }
      await dbDelete('progress', bookId);

      _libraryBooks = _libraryBooks.filter(b => b.id !== bookId);
      renderAllBooks();
      showToast(t('removed_from_library'));
    } catch (e) {
      console.error('Error deleting book:', e);
    }
  }

  async function openLibraryBook(bookId) {
    try {
      const book = await dbGet('books', bookId);
      if (!book) { showToast(t('error_loading')); return; }

      const stored = await dbGet('files', bookId);
      if (!stored || !stored.blob) { showToast(t('error_loading')); return; }

      state.currentBook = book;
      state.currentFormat = stored.type;
      state.currentPage = 0;
      state.pdfPage = 1;

      // Restore progress
      const progress = await dbGet('progress', bookId);
      if (progress) {
        state.currentPage = progress.page || 0;
        state.pdfPage = progress.page || 1;
      }

      switch (stored.type) {
        case 'pdf':
          await loadPDFFromArrayBuffer(stored.blob);
          renderPDFPage(state.pdfPage);
          break;
        case 'docx':
          await loadDOCXFromArrayBuffer(stored.blob);
          if (state.readingMode === 'paginated' && state.currentPage > 0) goToPage(state.currentPage);
          break;
        case 'epub':
          await loadEPUBFromArrayBuffer(stored.blob);
          if (state.readingMode === 'paginated' && state.currentPage > 0) goToPage(state.currentPage);
          break;
        case 'txt':
          const text = new TextDecoder().decode(stored.blob);
          displayBookContent(txtToHtml(text));
          if (state.readingMode === 'paginated' && state.currentPage > 0) goToPage(state.currentPage);
          break;
      }

      showReaderScreen();
    } catch (e) {
      console.error('Error opening library book:', e);
      showToast(t('error_loading'));
    }
  }

  async function loadSuggestionBook(bookId, startPage) {
    try {
      // Find book in manifest or discovered
      let book = _manifestBooks.find(b => b.id === bookId);
      if (!book) book = _discoveredBooks.find(b => b.id === bookId);
      
      // If still not found, try re-loading manifest
      if (!book) {
        const resp = await fetch('suggestions/manifest.json');
        const manifest = await resp.json();
        book = manifest.books.find(b => b.id === bookId);
      }
      if (!book) return;

      const bookResp = await fetch('suggestions/' + book.file);
      const text = await bookResp.text();

      const htmlId = 'suggestion_' + bookId;
      state.currentBook = {
        id: htmlId,
        title: state.lang === 'ar' ? book.title : book.titleEn,
        format: 'txt',
        lastRead: Date.now(),
        isSuggestion: true,
        suggestionId: bookId,
        coverColor: book.cover_color,
        totalPages: 0
      };
      state.currentFormat = 'txt';
      state.currentPage = 0;

      const html = txtToHtml(text);
      displayBookContent(html);

      if (state.totalPages > 0) {
        state.currentBook.totalPages = state.totalPages;
      }

      await dbPut('books', state.currentBook);

      // Restore progress if provided
      if (startPage && startPage > 0) {
        state.currentPage = startPage - 1;
        if (state.readingMode === 'paginated') {
          goToPage(state.currentPage);
        }
      }

      showReaderScreen();
    } catch (e) {
      console.error('Error loading suggestion:', e);
      showToast(t('error_loading'));
    }
  }

  // ---- Screen Management ----
  function showReaderScreen() {
    $('home-screen').classList.add('hidden');
    $('reader-screen').classList.remove('hidden');
    $('book-title').textContent = state.currentBook ? state.currentBook.title : '';

    if (state.currentFormat === 'pdf') {
      $('pdf-viewer').classList.remove('hidden');
      $('book-viewer').classList.add('hidden');
      $('page-nav').classList.add('hidden');
    } else {
      $('book-viewer').classList.remove('hidden');
      $('pdf-viewer').classList.add('hidden');
    }

    loadBookmarks();
    showToolbar();
  }

  function showHomeScreen() {
    $('reader-screen').classList.add('hidden');
    $('home-screen').classList.remove('hidden');
    $('pdf-viewer').classList.add('hidden');
    $('book-viewer').classList.add('hidden');
    $('search-panel').classList.add('hidden');
    $('font-panel').classList.add('hidden');
    closeSidebar();

    // Reset progress bar
    $('progress-bar').style.width = '0%';

    // Reload continue reading
    loadContinueReading();
    loadSuggestions();
  }

  // ---- Sidebar ----
  function openSidebar(tab = 'toc') {
    $('sidebar-overlay').classList.remove('hidden');
    $('sidebar').classList.remove('hidden');

    // Switch tab
    if (tab === 'toc') {
      $('tab-toc').classList.add('active');
      $('tab-bookmarks').classList.remove('active');
      $('toc-list').classList.remove('hidden');
      $('bookmarks-list').classList.add('hidden');
    } else {
      $('tab-toc').classList.remove('active');
      $('tab-bookmarks').classList.add('active');
      $('toc-list').classList.add('hidden');
      $('bookmarks-list').classList.remove('hidden');
    }
  }

  function closeSidebar() {
    $('sidebar-overlay').classList.add('hidden');
    $('sidebar').classList.add('hidden');
  }

  // ---- Font Panel ----
  function openFontPanel() {
    $('font-panel').classList.toggle('hidden');
    $('font-size-display').textContent = state.fontSize;
    $('line-height-range').value = state.lineHeight;

    // Update mode buttons
    $('mode-paginated').classList.toggle('active', state.readingMode === 'paginated');
    $('mode-continuous').classList.toggle('active', state.readingMode === 'continuous');
  }

  function changeFontSize(delta) {
    state.fontSize = Math.max(12, Math.min(32, state.fontSize + delta));
    $('font-size-display').textContent = state.fontSize;
    const content = $('book-content');
    if (content) {
      content.style.fontSize = state.fontSize + 'px';
    }
    saveSettings();

    // Recalculate pages if in paginated mode
    if (state.readingMode === 'paginated' && state.currentFormat !== 'pdf') {
      setTimeout(() => {
        setupPaginatedMode(content);
      }, 100);
    }
  }

  function changeLineHeight(val) {
    state.lineHeight = parseFloat(val);
    const content = $('book-content');
    if (content) {
      content.style.lineHeight = state.lineHeight;
    }
    saveSettings();

    if (state.readingMode === 'paginated' && state.currentFormat !== 'pdf') {
      setTimeout(() => {
        setupPaginatedMode(content);
      }, 100);
    }
  }

  function setReadingMode(mode) {
    state.readingMode = mode;
    
    // Sync font panel buttons
    $('mode-paginated').classList.toggle('active', mode === 'paginated');
    $('mode-continuous').classList.toggle('active', mode === 'continuous');
    
    // Sync nav mode buttons
    $('nav-mode-paginated').classList.toggle('active', mode === 'paginated');
    $('nav-mode-continuous').classList.toggle('active', mode === 'continuous');

    if (state.currentFormat && state.currentFormat !== 'pdf') {
      const content = $('book-content');
      if (mode === 'paginated') {
        setupPaginatedMode(content);
      } else {
        setupContinuousMode(content);
        // Show page-nav but in continuous mode style (hide prev/next, show mode switch)
        $('page-nav').classList.remove('hidden');
        $('page-nav').classList.add('continuous-nav');
      }
    }

    saveSettings();
  }

  // ---- Swipe / Touch Gestures ----
  let touchStartX = 0;
  let touchStartY = 0;

  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;

    const isRTL = state.lang === 'ar';

    if (state.currentFormat === 'pdf') {
      if ((dx > 0 && !isRTL) || (dx < 0 && isRTL)) {
        // Swipe right in LTR or left in RTL = previous
        renderPDFPage(state.pdfPage - 1);
      } else {
        renderPDFPage(state.pdfPage + 1);
      }
    } else if (state.readingMode === 'paginated') {
      if ((dx > 0 && !isRTL) || (dx < 0 && isRTL)) {
        goToPage(state.currentPage - 1);
      } else {
        goToPage(state.currentPage + 1);
      }
    }
  }

  // ---- Keyboard Navigation ----
  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT') return;

    const isRTL = state.lang === 'ar';

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        if (state.currentFormat === 'pdf') {
          renderPDFPage(state.pdfPage + (isRTL ? -1 : 1));
        } else if (state.readingMode === 'paginated') {
          goToPage(state.currentPage + (isRTL ? -1 : 1));
        }
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        if (state.currentFormat === 'pdf') {
          renderPDFPage(state.pdfPage + (isRTL ? 1 : -1));
        } else if (state.readingMode === 'paginated') {
          goToPage(state.currentPage + (isRTL ? 1 : -1));
        }
        break;
      case 'b':
        toggleBookmark();
        break;
      case 'f':
        toggleFocusMode();
        break;
      case 'Escape':
        if (!$('search-panel').classList.contains('hidden')) {
          closeSearch();
        } else if (!$('font-panel').classList.contains('hidden')) {
          $('font-panel').classList.add('hidden');
        } else if (!$('sidebar').classList.contains('hidden')) {
          closeSidebar();
        } else {
          showHomeScreen();
        }
        break;
    }
  }

  // ---- Event Bindings ----
  function bindEvents() {
    // Home screen
    const uploadArea = $('upload-area');
    const fileInput = $('file-input');

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.querySelector('.upload-frame').classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.querySelector('.upload-frame').classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.querySelector('.upload-frame').classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
      }
    });

    // Language switches
    $('lang-switch-home').addEventListener('click', () => {
      setLanguage(state.lang === 'ar' ? 'en' : 'ar');
    });
    $('lang-switch-reader').addEventListener('click', () => {
      setLanguage(state.lang === 'ar' ? 'en' : 'ar');
    });

    // Theme toggles
    $('theme-toggle-home').addEventListener('click', cycleTheme);
    $('theme-toggle-reader').addEventListener('click', cycleTheme);

    // Reader toolbar
    $('back-btn').addEventListener('click', showHomeScreen);
    $('toc-btn').addEventListener('click', () => openSidebar('toc'));
    $('bookmark-btn').addEventListener('click', toggleBookmark);
    $('font-btn').addEventListener('click', openFontPanel);
    $('focus-btn').addEventListener('click', toggleFocusMode);
    $('search-btn').addEventListener('click', openSearch);

    // PDF controls
    $('pdf-prev').addEventListener('click', () => renderPDFPage(state.pdfPage - 1));
    $('pdf-next').addEventListener('click', () => renderPDFPage(state.pdfPage + 1));
    $('pdf-zoom-in').addEventListener('click', () => {
      state.pdfScale = Math.min(3, state.pdfScale + 0.2);
      renderPDFPage(state.pdfPage);
    });
    $('pdf-zoom-out').addEventListener('click', () => {
      state.pdfScale = Math.max(0.5, state.pdfScale - 0.2);
      renderPDFPage(state.pdfPage);
    });

    // Page navigation
    $('page-prev').addEventListener('click', () => goToPage(state.currentPage - 1));
    $('page-next').addEventListener('click', () => goToPage(state.currentPage + 1));

    // Nav mode switch (paginated / continuous) in page-nav bar
    $('nav-mode-paginated').addEventListener('click', () => setReadingMode('paginated'));
    $('nav-mode-continuous').addEventListener('click', () => setReadingMode('continuous'));

    // Sidebar
    $('sidebar-close').addEventListener('click', closeSidebar);
    $('sidebar-overlay').addEventListener('click', closeSidebar);
    $('tab-toc').addEventListener('click', () => openSidebar('toc'));
    $('tab-bookmarks').addEventListener('click', () => openSidebar('bookmarks'));

    // Font panel
    $('font-close').addEventListener('click', () => $('font-panel').classList.add('hidden'));
    $('font-decrease').addEventListener('click', () => changeFontSize(-1));
    $('font-increase').addEventListener('click', () => changeFontSize(1));
    $('line-height-range').addEventListener('input', (e) => changeLineHeight(e.target.value));
    $('mode-paginated').addEventListener('click', () => setReadingMode('paginated'));
    $('mode-continuous').addEventListener('click', () => setReadingMode('continuous'));

    // Search
    $('search-close').addEventListener('click', closeSearch);
    $('search-input').addEventListener('input', (e) => performSearch(e.target.value));

    // Touch gestures
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Keyboard
    document.addEventListener('keydown', handleKeydown);

    // Toolbar auto-hide on reader interaction
    const bookViewer = $('book-viewer');
    const pdfViewer = $('pdf-container');
    [bookViewer, pdfViewer].forEach(el => {
      el.addEventListener('click', (e) => {
        // Don't toggle toolbar if clicking on a link or interactive element
        if (e.target.closest('a, button')) return;
        
        if (state.toolbarVisible) {
          resetToolbarTimer();
          // Show page position toast on tap
          if (state.currentFormat === 'pdf') {
            showPageToast(state.pdfPage, state.pdfTotalPages);
          } else if (state.totalPages > 0) {
            showPageToast(state.currentPage + 1, state.totalPages);
          }
        } else {
          showToolbar();
        }
      });
      el.addEventListener('scroll', () => {
        if (!state.toolbarVisible) showToolbar();
        resetToolbarTimer();
      });
    });

    // Window resize - recalculate pages
    window.addEventListener('resize', () => {
      if (state.readingMode === 'paginated' && state.currentFormat !== 'pdf' && !$('book-viewer').classList.contains('hidden')) {
        clearTimeout(state._resizeTimer);
        state._resizeTimer = setTimeout(() => {
          setupPaginatedMode($('book-content'));
        }, 300);
      }
    });
  }

  // ---- Initialize ----
  async function init() {
    // Configure PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // Load settings from IndexedDB
    await loadSettings();

    // Apply saved settings
    setTheme(state.theme);
    setLanguage(state.lang);

    // Apply font size
    const content = $('book-content');
    if (content) {
      content.style.fontSize = state.fontSize + 'px';
      content.style.lineHeight = state.lineHeight;
    }

    // Bind events
    bindEvents();

    // Load suggestions
    loadSuggestions();

    // Load continue reading
    loadContinueReading();
  }

  // Start the app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
