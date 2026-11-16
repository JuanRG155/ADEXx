/**
 * ADEXx // VAULT ENGINE
 * Estética: Negro & Carmesí / Minimal Cuadrado
 * Orden: 1. Pixel Art -> 2. Curis -> 3. Edits
 * Sistema de Carga Dinámica y Persistencia
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'ADEXX_PORTFOLIO_DATA_V5_DATE_SORTED';

  // State
  let portfolioData = null;
  let activeFilter = 'all';
  let searchTerm = '';
  let isSquareMode = true;
  let isPixelPerfect = true; // default true for crisp pixel art

  // Lightbox State
  let currentLightboxList = [];
  let currentLightboxIndex = -1;

  // DOM Elements
  const elements = {
    // Badges & Counters
    badgePixelart: document.getElementById('badgePixelart'),
    badgeCuris: document.getElementById('badgeCuris'),
    badgeEdits: document.getElementById('badgeEdits'),
    statTotalItems: document.getElementById('statTotalItems'),
    statPixels: document.getElementById('statPixels'),
    statCuris: document.getElementById('statCuris'),
    statEdits: document.getElementById('statEdits'),
    metaCountPixel: document.getElementById('metaCountPixel'),
    metaCountCuris: document.getElementById('metaCountCuris'),
    metaCountEdits: document.getElementById('metaCountEdits'),
    countFilterAll: document.getElementById('countFilterAll'),
    countFilterPixel: document.getElementById('countFilterPixel'),
    countFilterCuris: document.getElementById('countFilterCuris'),
    countFilterEdits: document.getElementById('countFilterEdits'),

    // Grids
    gridPixelart: document.getElementById('gridPixelart'),
    gridCuris: document.getElementById('gridCuris'),
    gridEdits: document.getElementById('gridEdits'),
    sectionPixelart: document.getElementById('pixelart'),
    sectionCuris: document.getElementById('curis'),
    sectionEdits: document.getElementById('edits'),

    // Search & Filter
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    filterPills: document.querySelectorAll('.filter-pill'),
    btnGridSquare: document.getElementById('btnGridSquare'),
    btnGridFit: document.getElementById('btnGridFit'),
    btnTogglePixelMode: document.getElementById('btnTogglePixelMode'),

    // Lightbox
    lightboxModal: document.getElementById('lightboxModal'),
    modalCategory: document.getElementById('modalCategory'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    mediaStage: document.getElementById('mediaStage'),
    modalPrev: document.getElementById('modalPrev'),
    modalNext: document.getElementById('modalNext'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalDownloadBtn: document.getElementById('modalDownloadBtn'),
    modalTogglePixel: document.getElementById('modalTogglePixel'),
    modalFilename: document.getElementById('modalFilename'),
    modalSize: document.getElementById('modalSize'),
    modalDate: document.getElementById('modalDate'),
    modalIndex: document.getElementById('modalIndex'),

    // Data Manager Modal
    openDataManagerBtn: document.getElementById('openDataManagerBtn'),
    footerOpenData: document.getElementById('footerOpenData'),
    dataManagerModal: document.getElementById('dataManagerModal'),
    dataManagerCloseBtn: document.getElementById('dataManagerCloseBtn'),
    dataManagerDoneBtn: document.getElementById('dataManagerDoneBtn'),
    dropzone: document.getElementById('dropzone'),
    filePickerInput: document.getElementById('filePickerInput'),
    triggerFilePicker: document.getElementById('triggerFilePicker'),
    newCategory: document.getElementById('newCategory'),
    newTitle: document.getElementById('newTitle'),
    newCustomPath: document.getElementById('newCustomPath'),
    btnAddCustomItem: document.getElementById('btnAddCustomItem'),
    uploadFeedback: document.getElementById('uploadFeedback'),
    tabBtns: document.querySelectorAll('.data-manager-tabs .tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    jsonEditorArea: document.getElementById('jsonEditorArea'),
    btnExportJSON: document.getElementById('btnExportJSON'),
    btnCopyJSON: document.getElementById('btnCopyJSON'),
    btnApplyJSON: document.getElementById('btnApplyJSON'),
    btnResetData: document.getElementById('btnResetData'),
    manageTotalCount: document.getElementById('manageTotalCount'),
    manageItemsList: document.getElementById('manageItemsList'),

    // Misc
    toastContainer: document.getElementById('toastContainer'),
    footerScrollTop: document.getElementById('footerScrollTop')
  };

  /**
   * INIT: Cargar datos con soporte para LocalStorage y fallback
   */
  async function init() {
    loadData();
    applyPixelPerfectClass();
    renderAll();
    setupEventListeners();
  }

  /**
   * Carga datos desde LocalStorage o data.js
   */
  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        portfolioData = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('No se pudo leer de localStorage:', e);
    }

    if (!portfolioData && window.PORTFOLIO_DATA) {
      // Clonar para evitar mutación directa del fallback
      portfolioData = JSON.parse(JSON.stringify(window.PORTFOLIO_DATA));
    }

    if (!portfolioData) {
      portfolioData = {
        categories: [
          { id: 'pixelart', title: '01 / PIXEL ART', items: [] },
          { id: 'curis', title: '02 / CURIS', items: [] },
          { id: 'edits', title: '03 / EDITS', items: [] }
        ]
      };
    }

    updateCounts();
  }

  /**
   * Guarda el estado actual en LocalStorage
   */
  function persistData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolioData));
    } catch (e) {
      console.warn('Error al guardar en LocalStorage:', e);
    }
  }

  /**
   * Actualiza contadores y estadísticas
   */
  function updateCounts() {
    const pixelCat = portfolioData.categories.find(c => c.id === 'pixelart') || { items: [] };
    const curisCat = portfolioData.categories.find(c => c.id === 'curis') || { items: [] };
    const editsCat = portfolioData.categories.find(c => c.id === 'edits') || { items: [] };

    const pixelCount = pixelCat.items.length;
    const curisCount = curisCat.items.length;
    const editsCount = editsCat.items.length;
    const totalCount = pixelCount + curisCount + editsCount;

    // Header Badges
    if (elements.badgePixelart) elements.badgePixelart.textContent = pixelCount;
    if (elements.badgeCuris) elements.badgeCuris.textContent = curisCount;
    if (elements.badgeEdits) elements.badgeEdits.textContent = editsCount;

    // Stats Bar
    if (elements.statTotalItems) elements.statTotalItems.textContent = totalCount;
    if (elements.statPixels) elements.statPixels.textContent = pixelCount;
    if (elements.statCuris) elements.statCuris.textContent = curisCount;
    if (elements.statEdits) elements.statEdits.textContent = editsCount;

    // Section Meta
    if (elements.metaCountPixel) elements.metaCountPixel.textContent = `${pixelCount} ELEMENTOS`;
    if (elements.metaCountCuris) elements.metaCountCuris.textContent = `${curisCount} ELEMENTOS`;
    if (elements.metaCountEdits) elements.metaCountEdits.textContent = `${editsCount} ELEMENTOS`;

    // Filter Badges
    if (elements.countFilterAll) elements.countFilterAll.textContent = totalCount;
    if (elements.countFilterPixel) elements.countFilterPixel.textContent = pixelCount;
    if (elements.countFilterCuris) elements.countFilterCuris.textContent = curisCount;
    if (elements.countFilterEdits) elements.countFilterEdits.textContent = editsCount;

    if (elements.manageTotalCount) elements.manageTotalCount.textContent = totalCount;
  }

  /**
   * Renderiza las 3 secciones en el orden estricto:
   * 1. PIXEL ART -> 2. CURIS -> 3. EDITS
   */
  function renderAll() {
    updateCounts();

    const pixelCat = portfolioData.categories.find(c => c.id === 'pixelart');
    const curisCat = portfolioData.categories.find(c => c.id === 'curis');
    const editsCat = portfolioData.categories.find(c => c.id === 'edits');

    // Section 1: Pixel Art
    renderSectionGrid(elements.gridPixelart, pixelCat ? pixelCat.items : [], 'pixelart');
    
    // Section 2: Curis
    renderSectionGrid(elements.gridCuris, curisCat ? curisCat.items : [], 'curis');

    // Section 3: Edits
    renderSectionGrid(elements.gridEdits, editsCat ? editsCat.items : [], 'edits');

    // Apply visibility based on filter
    applyFilterVisibility();
  }

  /**
   * Renderiza una rejilla de tarjetas cuadradas
   */
  function renderSectionGrid(gridElement, items, categoryId) {
    if (!gridElement) return;

    // Ordenar elementos estrictamente por fecha descendente (más reciente primero)
    const sortedByDate = [...items].sort((a, b) => {
      const tA = a.timestamp || (a.date ? new Date(a.date).getTime() : 0);
      const tB = b.timestamp || (b.date ? new Date(b.date).getTime() : 0);
      return tB - tA;
    });

    // Filtrar por término de búsqueda si existe
    const filtered = sortedByDate.filter(item => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(term) ||
        (item.filename && item.filename.toLowerCase().includes(term))
      );
    });

    if (filtered.length === 0) {
      gridElement.innerHTML = `
        <div class="empty-gallery">
          <p>[ SIN ELEMENTOS COINCIDENTES EN ESTA CATEGORÍA ]</p>
        </div>
      `;
      return;
    }

    gridElement.innerHTML = '';
    const fragment = document.createDocumentFragment();

    filtered.forEach((item, index) => {
      const card = createArtCard(item, categoryId, index, filtered);
      fragment.appendChild(card);
    });

    gridElement.appendChild(fragment);
  }

  /**
   * Crea una tarjeta cuadrada minimalista
   */
  function createArtCard(item, categoryId, index, itemList) {
    const card = document.createElement('article');
    card.className = 'art-card';
    card.setAttribute('data-id', item.id);
    card.setAttribute('tabindex', '0');

    const isVideo = item.mediaType === 'video' || (item.filename && item.filename.endsWith('.mp4'));
    const shortCategoryCode = categoryId === 'pixelart' ? 'PX' : categoryId === 'curis' ? 'CR' : 'ED';
    const tagCode = `[${shortCategoryCode}-${String(index + 1).padStart(2, '0')}]`;

    // Inner HTML Structure
    card.innerHTML = `
      <div class="card-media-box">
        ${isVideo ? `
          <div class="video-badge"><span>▶ MP4</span></div>
          <div class="video-play-indicator">
            <div class="play-square">▶</div>
          </div>
          <video class="art-thumb" src="${item.src}#t=0.5" preload="metadata" muted playsinline></video>
        ` : `
          <img class="art-thumb ${categoryId === 'pixelart' ? 'pixel-source' : ''}" 
               src="${item.src}" 
               alt="${item.title}" 
               loading="lazy"
               onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'300\\' viewBox=\\'0 0 300 300\\'><rect width=\\'300\\' height=\\'300\\' fill=\\'%23f2f0eb\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'%23b8142c\\' font-family=\\'monospace\\' font-size=\\'13\\' text-anchor=\\'middle\\'>[OBRA NO DISPONIBLE]</text></svg>'">
        `}
      </div>
      <div class="card-details">
        <div class="card-topline">
          <span class="card-id-tag">${tagCode}</span>
          <span class="card-size-tag">${item.date ? item.date + ' &bull; ' : ''}${item.size || ''}</span>
        </div>
        <h4 class="card-title">${item.title}</h4>
        <span class="card-filename">${item.filename || ''}</span>
      </div>
    `;

    // Video preview on hover
    if (isVideo) {
      const vid = card.querySelector('video');
      if (vid) {
        card.addEventListener('mouseenter', () => {
          vid.play().catch(() => {});
        });
        card.addEventListener('mouseleave', () => {
          vid.pause();
          vid.currentTime = 0.5;
        });
      }
    }

    // Open in Lightbox on click / Enter
    const openItem = () => openLightbox(itemList, index, categoryId);
    card.addEventListener('click', openItem);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openItem();
      }
    });

    return card;
  }

  /**
   * Control de Visibilidad por Filtros
   */
  function applyFilterVisibility() {
    if (elements.sectionPixelart) {
      elements.sectionPixelart.style.display = (activeFilter === 'all' || activeFilter === 'pixelart') ? 'block' : 'none';
    }
    if (elements.sectionCuris) {
      elements.sectionCuris.style.display = (activeFilter === 'all' || activeFilter === 'curis') ? 'block' : 'none';
    }
    if (elements.sectionEdits) {
      elements.sectionEdits.style.display = (activeFilter === 'all' || activeFilter === 'edits') ? 'block' : 'none';
    }
  }

  /**
   * LIGHTBOX / MODAL VISOR
   */
  function openLightbox(list, index, categoryId) {
    if (!list || list.length === 0 || index < 0 || index >= list.length) return;

    currentLightboxList = list;
    currentLightboxIndex = index;

    renderLightboxContent();

    elements.lightboxModal.classList.add('active');
    elements.lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function renderLightboxContent() {
    const item = currentLightboxList[currentLightboxIndex];
    if (!item) return;

    const isVideo = item.mediaType === 'video' || (item.filename && item.filename.endsWith('.mp4'));

    elements.modalCategory.textContent = `[${(item.type || 'ARTE').toUpperCase()}]`;
    elements.modalTitle.textContent = item.title;
    elements.modalFilename.textContent = item.filename || item.src;
    elements.modalSize.textContent = item.size || 'N/A';
    elements.modalDate.textContent = item.date || 'RECIENTE';
    elements.modalIndex.textContent = `${currentLightboxIndex + 1} / ${currentLightboxList.length}`;

    elements.modalDownloadBtn.href = item.src;
    elements.modalDownloadBtn.setAttribute('download', item.filename || 'obra');

    // Limpiar stage
    elements.mediaStage.innerHTML = '';

    if (isVideo) {
      elements.modalTogglePixel.style.display = 'none';
      const videoEl = document.createElement('video');
      videoEl.src = item.src;
      videoEl.controls = true;
      videoEl.autoplay = true;
      videoEl.playsInline = true;
      elements.mediaStage.appendChild(videoEl);
    } else {
      elements.modalTogglePixel.style.display = 'inline-block';
      const imgEl = document.createElement('img');
      imgEl.src = item.src;
      imgEl.alt = item.title;
      if (item.type === 'pixelart') {
        imgEl.classList.add('pixel-source');
      }
      elements.mediaStage.appendChild(imgEl);
    }
  }

  function closeLightbox() {
    // Stop video if playing
    const vid = elements.mediaStage.querySelector('video');
    if (vid) {
      vid.pause();
      vid.src = '';
    }

    elements.lightboxModal.classList.remove('active');
    elements.lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function prevLightboxItem() {
    if (currentLightboxList.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxList.length) % currentLightboxList.length;
    renderLightboxContent();
  }

  function nextLightboxItem() {
    if (currentLightboxList.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxList.length;
    renderLightboxContent();
  }

  /**
   * DATA MANAGER MODAL (MEJORA DE CARGA Y GESTIÓN)
   */
  function openDataManager(tab = 'tab-upload') {
    elements.dataManagerModal.classList.add('active');
    elements.dataManagerModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Switch tab
    switchTab(tab);
    // Populate JSON area
    updateJsonEditor();
    // Populate manage list
    updateManageList();
  }

  function closeDataManager() {
    elements.dataManagerModal.classList.remove('active');
    elements.dataManagerModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function switchTab(targetTabId) {
    elements.tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === targetTabId);
    });
    elements.tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === targetTabId);
    });
  }

  function updateJsonEditor() {
    if (elements.jsonEditorArea) {
      elements.jsonEditorArea.value = JSON.stringify(portfolioData, null, 2);
    }
  }

  function updateManageList() {
    if (!elements.manageItemsList) return;
    elements.manageItemsList.innerHTML = '';

    const allItems = [];
    portfolioData.categories.forEach(c => {
      c.items.forEach(item => {
        allItems.push({ ...item, categoryId: c.id });
      });
    });

    if (allItems.length === 0) {
      elements.manageItemsList.innerHTML = '<div class="empty-gallery"><p>[ NO HAY OBRAS REGISTRADAS ]</p></div>';
      return;
    }

    allItems.forEach(item => {
      const row = document.createElement('div');
      row.className = 'manage-item-row';
      row.innerHTML = `
        <div class="manage-item-info">
          <span class="manage-badge">${item.categoryId.toUpperCase()}</span>
          <span class="manage-item-title">${item.title}</span>
        </div>
        <div class="manage-item-actions">
          <button class="mini-btn" data-action="view" data-id="${item.id}">VER</button>
          <button class="mini-btn btn-del" data-action="delete" data-id="${item.id}" data-cat="${item.categoryId}">✕ QUITAR</button>
        </div>
      `;

      row.querySelector('[data-action="delete"]').addEventListener('click', () => {
        deleteItem(item.categoryId, item.id);
      });

      row.querySelector('[data-action="view"]').addEventListener('click', () => {
        closeDataManager();
        const cat = portfolioData.categories.find(c => c.id === item.categoryId);
        const idx = cat ? cat.items.findIndex(i => i.id === item.id) : -1;
        if (idx !== -1) openLightbox(cat.items, idx, item.categoryId);
      });

      elements.manageItemsList.appendChild(row);
    });
  }

  function deleteItem(categoryId, itemId) {
    const category = portfolioData.categories.find(c => c.id === categoryId);
    if (!category) return;

    category.items = category.items.filter(i => i.id !== itemId);
    category.count = category.items.length;
    persistData();
    renderAll();
    updateManageList();
    updateJsonEditor();
    showToast(`Obra eliminada del catálogo`, 'info');
  }

  /**
   * Agrega un nuevo elemento al portafolio
   */
  function addNewItem(categoryId, title, src, filename, mediaType, size = '1.0 MB') {
    const category = portfolioData.categories.find(c => c.id === categoryId);
    if (!category) return;

    const newItem = {
      id: `${categoryId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: title || cleanFilename(filename || 'Nueva Obra'),
      filename: filename || 'custom_upload',
      src: src,
      type: categoryId,
      mediaType: mediaType,
      size: size,
      date: new Date().toISOString().split('T')[0]
    };

    // Agregar al inicio para visibilidad inmediata
    category.items.unshift(newItem);
    category.count = category.items.length;

    persistData();
    renderAll();
    updateManageList();
    updateJsonEditor();

    showToast(`¡Obra agregada a ${categoryId.toUpperCase()}!`, 'success');
  }

  function cleanFilename(name) {
    return name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  }

  /**
   * Manejo de Drag & Drop y Archivos Locales
   */
  function handleFiles(files) {
    if (!files || files.length === 0) return;

    const selectedCategory = elements.newCategory ? elements.newCategory.value : 'pixelart';
    let addedCount = 0;

    Array.from(files).forEach(file => {
      const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4');
      const isImage = file.type.startsWith('image/');

      if (!isImage && !isVideo) return;

      const objectUrl = URL.createObjectURL(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

      addNewItem(
        selectedCategory,
        elements.newTitle && elements.newTitle.value.trim() ? elements.newTitle.value.trim() : cleanFilename(file.name),
        objectUrl,
        file.name,
        isVideo ? 'video' : 'image',
        sizeMb
      );

      addedCount++;
    });

    if (elements.newTitle) elements.newTitle.value = '';
    showToast(`${addedCount} archivo(s) cargado(s) con éxito en ${selectedCategory.toUpperCase()}`);
  }

  /**
   * Toast Notifications
   */
  function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = `[!] ${message}`;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /**
   * Pixel-Perfect Toggle
   */
  function togglePixelPerfect() {
    isPixelPerfect = !isPixelPerfect;
    applyPixelPerfectClass();
    showToast(`Modo Pixel-Perfect: ${isPixelPerfect ? 'ACTIVADO' : 'DESACTIVADO'}`);
  }

  function applyPixelPerfectClass() {
    if (isPixelPerfect) {
      document.body.classList.add('pixel-perfect');
      if (elements.btnTogglePixelMode) elements.btnTogglePixelMode.classList.add('active');
      if (elements.modalTogglePixel) elements.modalTogglePixel.textContent = '[PX: ON]';
    } else {
      document.body.classList.remove('pixel-perfect');
      if (elements.btnTogglePixelMode) elements.btnTogglePixelMode.classList.remove('active');
      if (elements.modalTogglePixel) elements.modalTogglePixel.textContent = '[PX: OFF]';
    }
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // Search Filter
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.trim();
        if (elements.clearSearchBtn) {
          elements.clearSearchBtn.style.display = searchTerm ? 'block' : 'none';
        }
        renderAll();
      });
    }

    if (elements.clearSearchBtn) {
      elements.clearSearchBtn.addEventListener('click', () => {
        elements.searchInput.value = '';
        searchTerm = '';
        elements.clearSearchBtn.style.display = 'none';
        renderAll();
      });
    }

    // Category Filter Pills
    elements.filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        elements.filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeFilter = pill.getAttribute('data-filter');
        applyFilterVisibility();
      });
    });

    // Layout Toggle: 1:1 Square vs Fit
    if (elements.btnGridSquare) {
      elements.btnGridSquare.addEventListener('click', () => {
        elements.btnGridSquare.classList.add('active');
        if (elements.btnGridFit) elements.btnGridFit.classList.remove('active');
        document.querySelectorAll('.gallery-grid').forEach(g => {
          g.classList.add('square-mode');
          g.classList.remove('fit-mode');
        });
      });
    }

    if (elements.btnGridFit) {
      elements.btnGridFit.addEventListener('click', () => {
        elements.btnGridFit.classList.add('active');
        if (elements.btnGridSquare) elements.btnGridSquare.classList.remove('active');
        document.querySelectorAll('.gallery-grid').forEach(g => {
          g.classList.remove('square-mode');
          g.classList.add('fit-mode');
        });
      });
    }

    // Pixel Perfect Toggle
    if (elements.btnTogglePixelMode) {
      elements.btnTogglePixelMode.addEventListener('click', togglePixelPerfect);
    }
    if (elements.modalTogglePixel) {
      elements.modalTogglePixel.addEventListener('click', togglePixelPerfect);
    }

    // Lightbox Navigation
    if (elements.modalPrev) elements.modalPrev.addEventListener('click', prevLightboxItem);
    if (elements.modalNext) elements.modalNext.addEventListener('click', nextLightboxItem);
    if (elements.modalCloseBtn) elements.modalCloseBtn.addEventListener('click', closeLightbox);

    // Lightbox Backdrop Click
    if (elements.lightboxModal) {
      elements.lightboxModal.addEventListener('click', (e) => {
        if (e.target === elements.lightboxModal) closeLightbox();
      });
    }

    // Data Manager Modals
    if (elements.openDataManagerBtn) {
      elements.openDataManagerBtn.addEventListener('click', () => openDataManager('tab-upload'));
    }
    if (elements.footerOpenData) {
      elements.footerOpenData.addEventListener('click', () => openDataManager('tab-upload'));
    }
    if (elements.dataManagerCloseBtn) {
      elements.dataManagerCloseBtn.addEventListener('click', closeDataManager);
    }
    if (elements.dataManagerDoneBtn) {
      elements.dataManagerDoneBtn.addEventListener('click', closeDataManager);
    }
    if (elements.dataManagerModal) {
      elements.dataManagerModal.addEventListener('click', (e) => {
        if (e.target === elements.dataManagerModal) closeDataManager();
      });
    }

    // Tabs inside Data Manager
    elements.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
        if (tab === 'tab-json') updateJsonEditor();
        if (tab === 'tab-manage') updateManageList();
      });
    });

    // Dropzone Events
    if (elements.dropzone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        elements.dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          elements.dropzone.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        elements.dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          elements.dropzone.classList.remove('dragover');
        });
      });

      elements.dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt && dt.files) {
          handleFiles(dt.files);
        }
      });

      elements.dropzone.addEventListener('click', () => {
        if (elements.filePickerInput) elements.filePickerInput.click();
      });
    }

    if (elements.triggerFilePicker) {
      elements.triggerFilePicker.addEventListener('click', (e) => {
        e.stopPropagation();
        if (elements.filePickerInput) elements.filePickerInput.click();
      });
    }

    if (elements.filePickerInput) {
      elements.filePickerInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
      });
    }

    // Add Custom Path button
    if (elements.btnAddCustomItem) {
      elements.btnAddCustomItem.addEventListener('click', () => {
        const path = elements.newCustomPath ? elements.newCustomPath.value.trim() : '';
        if (!path) {
          showToast('Ingresa una ruta o URL válida', 'error');
          return;
        }

        const category = elements.newCategory ? elements.newCategory.value : 'pixelart';
        const title = elements.newTitle && elements.newTitle.value.trim() ? elements.newTitle.value.trim() : cleanFilename(path);
        const isVideo = path.endsWith('.mp4');

        addNewItem(category, title, path, path.split('/').pop(), isVideo ? 'video' : 'image', '1.0 MB');

        elements.newCustomPath.value = '';
        if (elements.newTitle) elements.newTitle.value = '';
      });
    }

    // JSON Actions
    if (elements.btnExportJSON) {
      elements.btnExportJSON.addEventListener('click', () => {
        const jsonStr = JSON.stringify(portfolioData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Archivo data.json descargado');
      });
    }

    if (elements.btnCopyJSON) {
      elements.btnCopyJSON.addEventListener('click', () => {
        if (!elements.jsonEditorArea) return;
        navigator.clipboard.writeText(elements.jsonEditorArea.value).then(() => {
          showToast('JSON copiado al portapapeles');
        }).catch(() => {
          showToast('No se pudo copiar automáticamente', 'error');
        });
      });
    }

    if (elements.btnApplyJSON) {
      elements.btnApplyJSON.addEventListener('click', () => {
        try {
          const parsed = JSON.parse(elements.jsonEditorArea.value);
          if (!parsed.categories || !Array.isArray(parsed.categories)) {
            throw new Error('Estructura inválida: debe contener un array "categories"');
          }
          portfolioData = parsed;
          persistData();
          renderAll();
          updateManageList();
          showToast('JSON aplicado y guardado correctamente', 'success');
        } catch (err) {
          showToast(`Error de sintaxis JSON: ${err.message}`, 'error');
        }
      });
    }

    if (elements.btnResetData) {
      elements.btnResetData.addEventListener('click', () => {
        if (confirm('¿Deseas restaurar el portafolio a los datos originales de data.js?')) {
          localStorage.removeItem(STORAGE_KEY);
          if (window.PORTFOLIO_DATA) {
            portfolioData = JSON.parse(JSON.stringify(window.PORTFOLIO_DATA));
          }
          renderAll();
          updateJsonEditor();
          updateManageList();
          showToast('Datos originales restaurados');
        }
      });
    }

    // Scroll Top Button
    if (elements.footerScrollTop) {
      elements.footerScrollTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // If modal active
      if (elements.lightboxModal && elements.lightboxModal.classList.contains('active')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevLightboxItem();
        if (e.key === 'ArrowRight') nextLightboxItem();
      }

      // If data manager modal active
      if (elements.dataManagerModal && elements.dataManagerModal.classList.contains('active')) {
        if (e.key === 'Escape') closeDataManager();
      }
    });
  }

  // Execute on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

