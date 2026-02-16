// ════════════════════════════════════════
// DATA LOADING (Dynamic JSON Loading)
// ════════════════════════════════════════

// Cache for loaded data to avoid redundant fetches
const dataCache = {};

// Global CPU specs (loaded dynamically)
let AMD_CPU_SPECS = undefined;
let INTEL_CPU_SPECS = undefined;

// Loading state management
let isLoading = false;
let loadingVendor = null;

/**
 * Loads vendor data from JSON files dynamically
 * @param {string} vendor - 'intel', 'amd', or 'amd-gpu'
 * @returns {Promise<Array>} The loaded data array
 */
async function loadVendorData(vendor) {
  // Return cached data if available
  if (dataCache[vendor]) {
    return dataCache[vendor];
  }

  // Prevent duplicate concurrent loads
  if (isLoading && loadingVendor === vendor) {
    // Wait for the current load to complete
    while (isLoading && loadingVendor === vendor) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return dataCache[vendor];
  }

  isLoading = true;
  loadingVendor = vendor;

  try {
    const response = await fetch(`js/data/${vendor}-data.json`);

    if (!response.ok) {
      throw new Error(`Failed to load ${vendor} data: ${response.statusText}`);
    }

    const data = await response.json();
    dataCache[vendor] = data;
    return data;
  } catch (error) {
    console.error(`Error loading ${vendor} data:`, error);
    // Return empty array as fallback
    return [];
  } finally {
    isLoading = false;
    loadingVendor = null;
  }
}

/**
 * Shows loading indicator in the timeline
 */
function showLoadingIndicator() {
  if (dom && dom.timeline) {
    dom.timeline.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Loading data...</div>';
  }
}

/**
 * Hides loading indicator and restores timeline content
 */
function hideLoadingIndicator() {
  // Loading indicator will be replaced by render()
}


// AMD GPU DATA will be loaded dynamically
// (Removed inline data - now loaded from js/data/amd-gpu-data.json)

// ════════════════════════════════════════
// VENDOR CONFIGURATION
// ════════════════════════════════════════
const VENDOR_CONFIG = {
  intel: {
    title: 'Intel Client + Server Roadmap',
    headerClass: 'header-intel',
    data: null, // Loaded dynamically from js/data/intel-data.json
    segmentTags: [
      { tag: 'desktop', color: '#4ade80', label: 'Desktop' },
      { tag: 'mobile', color: '#f472b6', label: 'Mobile' },
      { tag: 'server', color: '#fbbf24', label: 'Server' },
      { tag: 'embedded', color: '#c084fc', label: 'Embedded/IoT' }
    ],
    brandTags: [
      { tag: 'Core Ultra', color: '#38bdf8' },
      { tag: 'Core', color: '#fb923c' },
      { tag: 'Xeon', color: '#a78bfa' },
      { tag: 'Xeon 6 P', color: '#ef4444' },
      { tag: 'Xeon 6 E', color: '#14b8a6' }
    ],
    filterButtons: ['all', 'desktop', 'mobile', 'server', 'embedded']
  },
  amd: {
    title: 'AMD Zen Architecture Roadmap',
    headerClass: 'header-amd',
    data: null, // Loaded dynamically from js/data/amd-data.json
    segmentTags: [
      { tag: 'desktop', color: '#4ade80', label: 'Desktop' },
      { tag: 'laptop', color: '#f472b6', label: 'Laptop' },
      { tag: 'handheld', color: '#22d3ee', label: 'Handheld' },
      { tag: 'server', color: '#fbbf24', label: 'Server' }
    ],
    brandTags: [
      { tag: 'Ryzen', color: '#f97316' },
      { tag: 'Ryzen AI', color: '#06b6d4' },
      { tag: 'Threadripper', color: '#f59e0b' },
      { tag: 'Epyc', color: '#10b981' },
      { tag: 'Athlon', color: '#8b5cf6' }
    ],
    filterButtons: ['all', 'desktop', 'laptop', 'handheld', 'server'],
    codenameTable: [
      { zen: 'Zen 5', id: 'zen5', process: '4/3 nm', color: '#ef4444', desktop: 'Granite Ridge', hedt: 'Shimada Peak', laptop: 'Strix Point · Strix Halo · Gorgon Point · Fire Range', server: 'Turin / Turin Dense', handheld: 'Z2' },
      { zen: 'Zen 4', id: 'zen4', process: '5 nm', color: '#f97316', desktop: 'Raphael', hedt: 'Storm Peak', laptop: 'Dragon Range · Phoenix · Hawk Point · Hawk Point Refresh', server: 'Genoa · Genoa-X · Bergamo · Siena', handheld: 'Z1' },
      { zen: 'Zen 3+', id: 'zen3plus', process: '6 nm', color: '#f59e0b', desktop: '—', hedt: '', laptop: 'Rembrandt', server: '—', handheld: '' },
      { zen: 'Zen 3', id: 'zen3', process: '7 nm', color: '#84cc16', desktop: 'Vermeer · Cezanne', hedt: 'Chagall', laptop: 'Cezanne · Barceló', server: 'Milan · Milan-X', handheld: '' },
      { zen: 'Zen 2', id: 'zen2', process: '7 nm', color: '#14b8a6', desktop: 'Matisse · Renoir', hedt: 'Castle Peak', laptop: 'Renoir · Lucienne · Mendocino', server: 'Rome', handheld: '' },
      { zen: 'Zen+', id: 'zenplus', process: '12 nm', color: '#818cf8', desktop: 'Pinnacle Ridge', hedt: 'Colfax', laptop: 'Picasso', server: '—', handheld: '' },
      { zen: 'Zen', id: 'zen1', process: '14 nm', color: '#c084fc', desktop: 'Summit Ridge · Raven Ridge', hedt: 'Whitehaven', laptop: 'Raven Ridge · Dalí', server: 'Naples', handheld: '' }
    ],
    gpuData: null, // Loaded dynamically from js/data/amd-gpu-data.json
    gpuTitle: 'AMD GPU Roadmap'
  }
};

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════
let currentVendor = 'intel';
let currentTechTab = 'cpu';
let expandedGroups = new Set();
let activeSegmentTags = new Set();
let activeBrandTags = new Set();
let activeGpuSegment = 'all';
let activeGpuFormFactor = 'all';

// ════════════════════════════════════════
// CACHED DOM REFERENCES (Performance)
// ════════════════════════════════════════
let dom = null; // Will be initialized after DOM is ready

function initDomCache() {
  dom = {
    timeline: document.getElementById('timeline'),
    searchInput: document.getElementById('searchInput'),
    searchClear: document.getElementById('searchClear'),
    pageHeader: document.getElementById('pageHeader'),
    legendToggles: document.getElementById('legendToggles'),
    filterControls: document.getElementById('filterControls'),
    codenameTableWrap: document.getElementById('codenameTableWrap'),
    techTabs: document.getElementById('techTabs'),
    tabIntel: document.getElementById('tabIntel'),
    tabAmd: document.getElementById('tabAmd'),
    techTabCpu: document.getElementById('techTabCpu'),
    techTabGpu: document.getElementById('techTabGpu'),
    expandAllBtn: document.getElementById('expandAllBtn'),
    collapseAllBtn: document.getElementById('collapseAllBtn'),
    clearSelectionsBtn: document.getElementById('clearSelectionsBtn')
  };
}

// ════════════════════════════════════════
// PERFORMANCE UTILITIES
// ════════════════════════════════════════
let searchTimeout = null;

function debounce(func, delay) {
  return function(...args) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => func.apply(this, args), delay);
  };
}

const PERF_LOGGING_ENABLED = true; // Set to false in production

function perfStart(label) {
  if (PERF_LOGGING_ENABLED) console.time(label);
}

function perfEnd(label) {
  if (PERF_LOGGING_ENABLED) console.timeEnd(label);
}

// ════════════════════════════════════════
// VENDOR SWITCHING
// ════════════════════════════════════════
async function switchVendor(vendor) {
  currentVendor = vendor;
  currentTechTab = 'cpu';
  expandedGroups.clear();
  activeSegmentTags.clear();
  activeBrandTags.clear();
  activeGpuSegment = 'all';
  dom.searchInput.value = '';

  // Tab styling
  dom.tabIntel.className = 'vendor-tab' + (vendor === 'intel' ? ' active-intel' : '');
  dom.tabAmd.className = 'vendor-tab' + (vendor === 'amd' ? ' active-amd' : '');

  const cfg = VENDOR_CONFIG[vendor];

  // Show loading indicator
  showLoadingIndicator();

  // Load vendor data dynamically
  if (!cfg.data) {
    cfg.data = await loadVendorData(vendor);
  }

  // Load GPU data for AMD if not loaded
  if (vendor === 'amd' && !cfg.gpuData) {
    cfg.gpuData = await loadVendorData('amd-gpu');
  }

  // Load AMD CPU specs for detailed tables
  if (vendor === 'amd' && typeof AMD_CPU_SPECS === 'undefined') {
    try {
      const response = await fetch('js/data/amd-cpu-specs.json');
      if (response.ok) {
        AMD_CPU_SPECS = await response.json();
        console.log('AMD_CPU_SPECS loaded:', Object.keys(AMD_CPU_SPECS).length, 'codenames');
      }
    } catch (error) {
      console.warn('Could not load AMD CPU specs:', error);
    }
  }

  // Load Intel CPU specs for detailed tables
  if (vendor === 'intel' && typeof INTEL_CPU_SPECS === 'undefined') {
    try {
      const response = await fetch('js/data/intel-cpu-specs.json?v=' + Date.now());
      if (response.ok) {
        INTEL_CPU_SPECS = await response.json();
        console.log('INTEL_CPU_SPECS loaded:', Object.keys(INTEL_CPU_SPECS).length, 'codenames');
      }
    } catch (error) {
      console.warn('Could not load Intel CPU specs:', error);
    }
  }

  // Show/hide tech tabs
  if (cfg.gpuData) {
    dom.techTabs.classList.add('visible');
    dom.techTabCpu.classList.add('active');
    dom.techTabGpu.classList.remove('active');
  } else {
    dom.techTabs.classList.remove('visible');
  }

  // Header
  dom.pageHeader.innerHTML = `<h1 class="${cfg.headerClass}">${cfg.title}</h1><p>Processor Architecture Generations</p>`;

  buildLegend();
  buildFilters();
  buildCodenameTable();
  render();
}

function switchTech(tab) {
  if (currentTechTab === tab) return;
  currentTechTab = tab;
  expandedGroups.clear();
  activeSegmentTags.clear();
  activeBrandTags.clear();
  activeGpuSegment = 'all';
  dom.searchInput.value = '';

  dom.techTabCpu.classList.toggle('active', tab === 'cpu');
  dom.techTabGpu.classList.toggle('active', tab === 'gpu');

  const cfg = VENDOR_CONFIG[currentVendor];
  if (tab === 'gpu') {
    dom.pageHeader.innerHTML = `<h1 class="${cfg.headerClass}">${cfg.gpuTitle}</h1><p>Instinct · Radeon · Radeon PRO · FirePro</p>`;
    // Hide CPU-only UI
    dom.codenameTableWrap.innerHTML = '';
    buildGpuLegend();
    buildGpuFilters();
  } else {
    dom.pageHeader.innerHTML = `<h1 class="${cfg.headerClass}">${cfg.title}</h1><p>Processor Architecture Generations</p>`;
    buildLegend();
    buildFilters();
    buildCodenameTable();
  }
  render();
}

function buildCodenameTable() {
  const cfg = VENDOR_CONFIG[currentVendor];
  const wrap = dom.codenameTableWrap;
  if (!cfg.codenameTable) { wrap.innerHTML = ''; return; }

  const rows = cfg.codenameTable;
  wrap.innerHTML = `
    <div class="codename-table-wrap collapsed" id="codenameTablePanel">
      <div class="codename-table-header" onclick="document.getElementById('codenameTablePanel').classList.toggle('collapsed')">
        <span class="codename-table-title">⚡ Codename Quick Reference</span>
        <span class="codename-table-toggle">▾</span>
      </div>
      <div class="codename-table-body">
        <table class="codename-table">
          <thead>
            <tr>
              <th>Zen Gen</th>
              <th>Process</th>
              <th>Desktop</th>
              <th>Laptop</th>
              <th>Handheld</th>
              <th>Server</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr onclick="jumpToArch('${r.id}')" title="Click to expand ${r.zen}">
                <td><span class="ct-zen" style="color:${r.color}">${r.zen}</span></td>
                <td><span class="ct-process">${r.process}</span></td>
                <td><span class="ct-codename">${r.desktop}</span>${r.hedt ? `<span class="ct-hedt">HEDT: ${r.hedt}</span>` : ''}</td>
                <td><span class="ct-codename">${r.laptop}</span></td>
                <td><span class="ct-codename">${r.handheld || '—'}</span></td>
                <td><span class="ct-codename">${r.server}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function jumpToArch(id) {
  expandedGroups.add(id);
  render();
  setTimeout(() => {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }, 100);
}

function buildLegend() {
  const cfg = VENDOR_CONFIG[currentVendor];
  const el = dom.legendToggles;
  let html = '';
  cfg.segmentTags.forEach(t => {
    html += `<div class="legend-item" data-tag-type="segment" data-tag="${t.tag}" style="--tag-color:${t.color}" onclick="toggleLegendTag(this)"><div class="legend-dot" style="background:${t.color}"></div>${t.label}</div>`;
  });
  html += '<div class="legend-sep"></div>';
  cfg.brandTags.forEach(t => {
    html += `<div class="legend-item" data-tag-type="brand" data-tag="${t.tag}" style="--tag-color:${t.color}" onclick="toggleLegendTag(this)"><div class="legend-dot" style="background:${t.color}"></div>${t.tag}</div>`;
  });
  el.innerHTML = html;
}

function buildFilters() {
  const cfg = VENDOR_CONFIG[currentVendor];
  const el = dom.filterControls;
  el.innerHTML = cfg.filterButtons.map(f =>
    `<button class="filter-btn${f === 'all' ? ' active' : ''}" data-filter="${f}">${f.charAt(0).toUpperCase() + f.slice(1)}</button>`
  ).join('');
  el.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      if (filter === 'all') { activeSegmentTags.clear(); }
      else { activeSegmentTags = new Set([filter]); }
      syncLegendToggles();
      applyFilters();
    });
  });
}

function buildGpuLegend() {
  const el = dom.legendToggles;
  const segments = [
    { tag: 'datacenter', label: 'Datacenter', color: '#ef4444' },
    { tag: 'workstation', label: 'Workstation', color: '#818cf8' },
    { tag: 'consumer', label: 'Consumer', color: '#10b981' }
  ];

  const formFactors = [
    { tag: 'pcie', label: 'PCIe', color: '#60a5fa' },
    { tag: 'oam', label: 'OAM', color: '#f59e0b' }
  ];

  let html = '';
  segments.forEach(t => {
    html += `<div class="legend-item gpu-legend-segment" data-tag="${t.tag}" style="--tag-color:${t.color}"><div class="legend-dot" style="background:${t.color}"></div>${t.label}</div>`;
  });
  html += '<div class="legend-sep"></div>';
  formFactors.forEach(t => {
    html += `<div class="legend-item gpu-legend-form" data-tag="${t.tag}" style="--tag-color:${t.color}"><div class="legend-dot" style="background:${t.color}"></div>${t.label}</div>`;
  });
  el.innerHTML = html;
}

// Update GPU legend to reflect active filters
function updateGpuLegend() {
  // Update segment indicators
  document.querySelectorAll('.gpu-legend-segment').forEach(item => {
    if (item.dataset.tag === activeGpuSegment) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update form factor indicators
  document.querySelectorAll('.gpu-legend-form').forEach(item => {
    if (item.dataset.tag === activeGpuFormFactor) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function buildGpuFilters() {
  activeGpuSegment = 'all';
  activeGpuFormFactor = 'all';
  const el = document.getElementById('filterControls');

  // Segment filters
  const segmentButtons = ['all', 'datacenter', 'workstation', 'consumer'];
  const segmentHtml = segmentButtons.map(f =>
    `<button class="filter-btn${f === 'all' ? ' active' : ''}" data-filter-type="segment" data-filter="${f}">${f.charAt(0).toUpperCase() + f.slice(1)}</button>`
  ).join('');

  // Form factor filters
  const formButtons = ['pcie', 'oam'];
  const formHtml = formButtons.map(f =>
    `<button class="filter-btn" data-filter-type="form" data-filter="${f}">${f.toUpperCase()}</button>`
  ).join('');

  el.innerHTML = segmentHtml + '<div class="filter-divider"></div>' + formHtml;

  el.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filterType = btn.dataset.filterType;
      const filterValue = btn.dataset.filter;

      if (filterType === 'segment') {
        // Clear other segment buttons
        el.querySelectorAll('[data-filter-type="segment"]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeGpuSegment = filterValue;
      } else if (filterType === 'form') {
        // Toggle form factor button
        if (btn.classList.contains('active')) {
          btn.classList.remove('active');
          activeGpuFormFactor = 'all';
        } else {
          el.querySelectorAll('[data-filter-type="form"]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeGpuFormFactor = filterValue;
        }
      }
      updateGpuLegend();
      applyFilters();
    });
  });
}

// ════════════════════════════════════════
// LEGEND TOGGLE LOGIC
// ════════════════════════════════════════
function toggleLegendTag(el) {
  const tagType = el.dataset.tagType;
  const tag = el.dataset.tag;
  const targetSet = tagType === 'segment' ? activeSegmentTags : activeBrandTags;
  if (targetSet.has(tag)) { targetSet.delete(tag); el.classList.remove('active'); }
  else { targetSet.add(tag); el.classList.add('active'); }

  if (tagType === 'segment') {
    const allSegs = VENDOR_CONFIG[currentVendor].segmentTags.map(t => t.tag);
    const filterEl = dom.filterControls;
    filterEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (activeSegmentTags.size === 0) {
      filterEl.querySelector('[data-filter="all"]')?.classList.add('active');
    } else if (activeSegmentTags.size === 1) {
      const v = [...activeSegmentTags][0];
      filterEl.querySelector(`[data-filter="${v}"]`)?.classList.add('active');
    }
  }
  updateLegendDimming();
  applyFilters();
}

function updateLegendDimming() {
  document.querySelectorAll('#legendToggles .legend-item').forEach(el => {
    const tagType = el.dataset.tagType;
    if (!tagType) return;
    const tag = el.dataset.tag;
    const targetSet = tagType === 'segment' ? activeSegmentTags : activeBrandTags;
    el.classList.remove('inactive');
    if (targetSet.size > 0 && !targetSet.has(tag)) el.classList.add('inactive');
  });
}

function syncLegendToggles() {
  document.querySelectorAll('#legendToggles .legend-item').forEach(el => {
    const tagType = el.dataset.tagType;
    if (!tagType) return;
    const tag = el.dataset.tag;
    const targetSet = tagType === 'segment' ? activeSegmentTags : activeBrandTags;
    el.classList.toggle('active', targetSet.has(tag));
    el.classList.remove('inactive');
  });
  updateLegendDimming();
}

// ════════════════════════════════════════
// RENDER
// ════════════════════════════════════════
function render() {
  perfStart('render');

  const timeline = dom.timeline;
  const cfg = VENDOR_CONFIG[currentVendor];
  const isGpu = currentTechTab === 'gpu' && cfg.gpuData;
  const data = isGpu ? cfg.gpuData : cfg.data;

  // Safety check: Don't render if data isn't loaded yet
  if (!data || !Array.isArray(data)) {
    perfEnd('render');
    return;
  }

  timeline.innerHTML = '';
  let animIndex = 0;

  if (isGpu) {
    renderGpu(timeline, data);
    perfEnd('render');
    applyFilters();
    return;
  }

  data.forEach(entry => {
    if (entry.era) {
      const sep = document.createElement('div');
      sep.className = 'era-separator';
      sep.innerHTML = `<span class="era-label">${entry.era}</span><div class="era-line"></div>`;
      timeline.appendChild(sep);
      return;
    }
    const arch = entry;

    const isExpanded = expandedGroups.has(arch.id);
    const group = document.createElement('div');
    group.className = `arch-group${isExpanded ? ' expanded' : ''}`;
    group.style.setProperty('--arch-color', arch.color);
    group.dataset.id = arch.id;
    group.style.animationDelay = `${animIndex * 0.04}s`;
    animIndex++;

    // Store filter metadata as data attributes for CSS-based filtering
    const segmentTags = arch.skus.flatMap(sku => sku.tags).filter((v, i, a) => a.indexOf(v) === i);
    const brandTags = arch.skus.map(sku => sku.brand).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
    const searchText = [
      arch.arch,
      arch.segment || '',
      arch.subtitle || '',
      ...arch.skus.flatMap(sku => [
        sku.name,
        sku.desc,
        ...sku.tags,
        sku.brand || '',
        ...((AMD_CPU_SPECS && AMD_CPU_SPECS[sku.name]) ? AMD_CPU_SPECS[sku.name].map(m => m.n) : (INTEL_CPU_SPECS && INTEL_CPU_SPECS[sku.name]) ? INTEL_CPU_SPECS[sku.name].map(m => m.n) : [])
      ])
    ].join('|').toLowerCase();

    group.dataset.segments = segmentTags.join(',');
    group.dataset.brands = brandTags.join(',');
    group.dataset.searchText = searchText;

    const hasServer = arch.skus.some(s => s.tags.includes('server'));
    const hasClient = arch.skus.some(s => !s.tags.includes('server'));
    let segBadge = '';
    if (hasServer && !hasClient) segBadge = '<span class="arch-segment-badge server-badge">Server</span>';
    else if (!hasServer && hasClient) segBadge = '<span class="arch-segment-badge client-badge">Client</span>';
    else segBadge = '<span class="arch-segment-badge client-badge">Client</span><span class="arch-segment-badge server-badge">Server</span>';

    group.innerHTML = `
      <div class="arch-header${arch.unreleased ? ' unreleased-arch' : ''}" onclick="toggleGroup('${arch.id}')">
        <div class="timeline-dot"></div>
        <span class="arch-name">${arch.arch}</span>
        <span class="arch-year">${arch.year}</span>
        ${arch.unreleased ? '<span class="unreleased-badge">Unreleased</span>' : ''}
        ${segBadge}
        <span class="expand-icon">▾</span>
        ${arch.subtitle ? `<div class="arch-subtitle">${arch.subtitle.replace(/ · /g, '<span class="sub-sep">·</span>')}</div>` : ''}
      </div>
      <div class="arch-body">
        <button class="collapse-specs-btn" id="collapse-specs-${arch.id}" onclick="event.stopPropagation(); collapseAllSpecs('${arch.id}')">▴ Collapse</button>
        <div class="skus-grid">
          ${arch.skus.map((sku, i) => {
            const cpuSpecs = (typeof AMD_CPU_SPECS !== 'undefined' && AMD_CPU_SPECS && AMD_CPU_SPECS[sku.name]) ? AMD_CPU_SPECS[sku.name]
              : (typeof INTEL_CPU_SPECS !== 'undefined' && INTEL_CPU_SPECS && INTEL_CPU_SPECS[sku.name]) ? INTEL_CPU_SPECS[sku.name] : null;
            const hasSpecs = cpuSpecs && cpuSpecs.length > 0;
            const specId = arch.id + '-' + sku.name.replace(/[^a-zA-Z0-9]/g, '_');
            return `
            <div class="sku-card${hasSpecs ? ' has-specs' : ''}${arch.unreleased && !hasSpecs ? ' unreleased-sku' : ''}" style="--card-order: ${i * 2};" data-sku-tags="${sku.tags.join(',')}" data-sku-brand="${sku.brand || ''}" ${hasSpecs ? `onclick="toggleCpuSpecs('${specId}')"` : ''}>
              <div class="sku-name">${sku.name}${hasSpecs ? `<span class="sku-spec-count">${cpuSpecs.length} SKUs</span>` : arch.unreleased ? '<span class="unreleased-notice">No specs yet</span>' : ''}</div>
              <div class="sku-desc">${sku.desc}</div>
              <div class="sku-tags">
                ${sku.tags.map(t => `<span class="sku-tag ${t}">${t}</span>`).join('')}
                ${sku.brand ? `<span class="sku-tag brand-${sku.brand.toLowerCase().replace(/\s+/g, '-')}">${sku.brand}</span>` : ''}
              </div>
              ${hasSpecs ? '<div class="sku-spec-toggle">▾ Specs</div>' : arch.unreleased ? '<div class="sku-spec-toggle unreleased-text">Unreleased</div>' : ''}
            </div>
            ${hasSpecs ? `<div class="cpu-spec-wrapper" id="cpu-spec-${specId}" style="--spec-order: ${i * 2 + 1000};">
              <div class="cpu-spec-overflow">
                <table class="cpu-spec-table">
                  <thead><tr>
                    <th>Name</th><th>Cores</th><th>Threads</th><th>Boost</th><th>Base</th><th>L3</th><th>TDP</th><th>Socket</th>${cpuSpecs[0]._srv
                      ? '<th>Sockets</th><th>PCIe</th><th>Memory</th>'
                      : '<th>GPU Model</th><th>GPU CUs</th><th>GPU Freq</th>'}<th>Product ID Tray</th>
                  </tr></thead>
                  <tbody>${cpuSpecs.map(m => `<tr>
                    <td class="cpu-model-name">${m.n}</td>
                    <td class="cpu-val-highlight">${m.c}</td><td>${m.t}</td>
                    <td class="cpu-val-highlight">${m.bst}</td><td>${m.bas}</td>
                    <td>${m.l3}</td><td>${m.tdp}</td><td>${m.sk}</td>${m._srv
                      ? `<td>${m.skc}</td><td>${m.pcie}</td><td>${m.mem}</td>`
                      : `<td class="cpu-val-gpu">${m.gm}</td><td>${m.gc}</td><td>${m.gf}</td>`}
                    <td>${m.tr}</td>
                  </tr>`).join('')}</tbody>
                </table>
              </div>
            </div>` : ''}
          `}).join('')}
        </div>
        <div class="links-area">
          <div class="links-header">
            <span class="links-label">Links</span>
            <button class="add-link-btn" onclick="showAddLinkForm('${arch.id}')">+ Add Link</button>
          </div>
          <div class="links-list">
            ${getLinks(arch).map((lnk, idx) => `
              <div class="link-item">
                <span class="link-icon">↗</span>
                <span class="link-label-text">${escHtml(lnk.label)}</span>
                <a href="${escHtml(lnk.url)}" target="_blank" rel="noopener">${escHtml(lnk.url)}</a>
                <button class="link-remove-btn" onclick="removeLink('${arch.id}', ${idx})" title="Remove">✕</button>
              </div>
            `).join('')}
            ${getLinks(arch).length === 0 ? '<div class="link-empty">No links yet</div>' : ''}
          </div>
          <div class="add-link-form" id="add-link-form-${arch.id}">
            <input type="text" placeholder="Label" id="link-label-${arch.id}" onkeydown="if(event.key==='Enter'){event.preventDefault();document.getElementById('link-url-${arch.id}').focus()}">
            <input type="text" placeholder="URL (https://...)" id="link-url-${arch.id}" onkeydown="if(event.key==='Enter')saveNewLink('${arch.id}')">
            <button class="add-link-save" onclick="saveNewLink('${arch.id}')">Add</button>
            <button class="add-link-cancel" onclick="hideAddLinkForm('${arch.id}')">Cancel</button>
          </div>
        </div>
        <div class="notes-area">
          <div class="notes-label">Notes</div>
          <textarea placeholder="Add notes for ${arch.arch}..." oninput="saveNotes('${arch.id}', this.value)">${loadNotes(arch.id)}</textarea>
        </div>
      </div>`;
    timeline.appendChild(group);
  });

  // Hide orphan era separators
  const children = [...timeline.children];
  for (let i = children.length - 1; i >= 0; i--) {
    if (children[i].classList.contains('era-separator')) {
      const next = children[i + 1];
      if (!next || next.classList.contains('era-separator')) children[i].style.display = 'none';
    }
  }

  perfEnd('render');

  // Apply current filters after rendering
  applyFilters();
}

// ════════════════════════════════════════
// GPU RENDER
// ════════════════════════════════════════
function renderGpu(timeline, data) {
  let animIndex = 0;
  data.forEach(entry => {
    if (entry.era) {
      const sep = document.createElement('div');
      sep.className = 'era-separator';
      sep.innerHTML = `<span class="era-label">${entry.era}</span><div class="era-line"></div>`;
      timeline.appendChild(sep);
      return;
    }
    const arch = entry;
    const specs = arch.gpuSpecs;

    const isExpanded = expandedGroups.has(arch.id);
    const group = document.createElement('div');
    group.className = `arch-group${isExpanded ? ' expanded' : ''}`;
    group.style.setProperty('--arch-color', arch.color);
    group.dataset.id = arch.id;
    group.style.animationDelay = `${animIndex * 0.04}s`;
    animIndex++;

    // Store filter metadata for CSS-based filtering
    const gpuSegment = arch.segment || 'datacenter'; // Use segment from data (datacenter, workstation, consumer)
    const modelText = (specs.consumer || specs.workstation)
      ? specs.models.map(m => `${m.name} ${m.cu} ${m.mem} ${m.memType} ${m.fp32} ${m.boost || ''}`)
      : specs.models.map(m => `${m.name} ${m.arch} ${m.process} ${m.mem} ${m.memType}`);
    const searchText = [arch.arch, arch.subtitle || '', specs.family, specs.desc, ...modelText].join('|').toLowerCase();

    // Collect unique form factors from all models
    const formFactors = [...new Set(specs.models.map(m => m.form).filter(Boolean))].join(',');

    group.dataset.gpuSegment = gpuSegment;
    group.dataset.gpuForms = formFactors;
    group.dataset.searchText = searchText;

    group.innerHTML = `
      <div class="arch-header" onclick="toggleGroup('${arch.id}')">
        <div class="timeline-dot"></div>
        <span class="arch-name">${arch.arch}</span>
        <span class="arch-year">${arch.year}</span>
        <span class="arch-segment-badge ${gpuSegment === 'consumer' ? 'client-badge' : gpuSegment === 'workstation' ? 'workstation-badge' : 'server-badge'}">${gpuSegment.charAt(0).toUpperCase() + gpuSegment.slice(1)}</span>
        <span class="expand-icon">▾</span>
        ${arch.subtitle ? `<div class="arch-subtitle">${arch.subtitle.replace(/ · /g, '<span class="sub-sep">·</span>')}</div>` : ''}
      </div>
      <div class="arch-body">
        <div class="gpu-family-desc">${specs.desc}</div>
        <div class="gpu-spec-overflow">
          <table class="gpu-spec-table">
            <thead>
              <tr>
                ${specs.consumer
                  ? '<th>Model</th><th>CUs</th><th>SPs</th><th>Boost</th><th>Game Clock</th><th>VRAM</th><th>Type</th><th>Bus</th><th>Bandwidth</th><th>Cache</th><th>FP32</th><th>TBP</th>'
                  : specs.workstation
                  ? '<th>Model</th><th>CUs</th><th>SPs</th><th>Boost</th><th>VRAM</th><th>Type</th><th>Bus</th><th>Bandwidth</th><th>Cache</th><th>FP32</th><th>FP64</th><th>TBP</th>'
                  : '<th>Model</th><th>Architecture</th><th>Process</th><th>CUs</th><th>Memory</th><th>Type</th><th>Bandwidth</th><th>FP32</th><th>FP32 Matrix</th><th>PCIe</th><th>Form</th><th>TBP</th>'
                }
              </tr>
            </thead>
            <tbody>
              ${specs.consumer
                ? specs.models.map(m => `
                <tr>
                  <td class="gpu-model-name">${m.name}</td>
                  <td>${m.cu}</td>
                  <td>${m.sp}</td>
                  <td class="gpu-val-highlight">${m.boost}</td>
                  <td>${m.game}</td>
                  <td class="gpu-val-highlight">${m.mem}</td>
                  <td>${m.memType}</td>
                  <td>${m.bus}</td>
                  <td>${m.bw}</td>
                  <td>${m.cache}</td>
                  <td class="gpu-val-highlight">${m.fp32}</td>
                  <td>${m.tbp}</td>
                </tr>
              `).join('')
                : specs.workstation
                ? specs.models.map(m => `
                <tr>
                  <td class="gpu-model-name">${m.name}</td>
                  <td>${m.cu}</td>
                  <td>${m.sp}</td>
                  <td class="gpu-val-highlight">${m.boost}</td>
                  <td class="gpu-val-highlight">${m.mem}</td>
                  <td>${m.memType}</td>
                  <td>${m.bus}</td>
                  <td>${m.bw}</td>
                  <td>${m.cache}</td>
                  <td class="gpu-val-highlight">${m.fp32}</td>
                  <td>${m.fp64}</td>
                  <td>${m.tbp}</td>
                </tr>
              `).join('')
                : specs.models.map(m => `
                <tr>
                  <td class="gpu-model-name">${m.name}</td>
                  <td>${m.arch}</td>
                  <td>${m.process}</td>
                  <td>${m.cu}</td>
                  <td class="gpu-val-highlight">${m.mem}</td>
                  <td>${m.memType}</td>
                  <td>${m.bw}</td>
                  <td class="gpu-val-highlight">${m.fp32}</td>
                  <td>${m.fp32m}</td>
                  <td>${m.pcie}</td>
                  <td>${m.form}</td>
                  <td>${m.tbp}</td>
                </tr>
              `).join('')
              }
            </tbody>
          </table>
        </div>
        <div class="links-area">
          <div class="links-header">
            <span class="links-label">Links</span>
            <button class="add-link-btn" onclick="showAddLinkForm('${arch.id}')">+ Add Link</button>
          </div>
          <div class="links-list">
            ${getLinks(arch).map((lnk, idx) => `
              <div class="link-item">
                <span class="link-icon">↗</span>
                <span class="link-label-text">${escHtml(lnk.label)}</span>
                <a href="${escHtml(lnk.url)}" target="_blank" rel="noopener">${escHtml(lnk.url)}</a>
                <button class="link-remove-btn" onclick="removeLink('${arch.id}', ${idx})" title="Remove">✕</button>
              </div>
            `).join('')}
            ${getLinks(arch).length === 0 ? '<div class="link-empty">No links yet</div>' : ''}
          </div>
          <div class="add-link-form" id="add-link-form-${arch.id}">
            <input type="text" placeholder="Label" id="link-label-${arch.id}" onkeydown="if(event.key==='Enter'){event.preventDefault();document.getElementById('link-url-${arch.id}').focus()}">
            <input type="text" placeholder="URL (https://...)" id="link-url-${arch.id}" onkeydown="if(event.key==='Enter')saveNewLink('${arch.id}')">
            <button class="add-link-save" onclick="saveNewLink('${arch.id}')">Add</button>
            <button class="add-link-cancel" onclick="hideAddLinkForm('${arch.id}')">Cancel</button>
          </div>
        </div>
        <div class="notes-area">
          <div class="notes-label">Notes</div>
          <textarea placeholder="Add notes for ${arch.arch}..." oninput="saveNotes('${arch.id}', this.value)">${loadNotes(arch.id)}</textarea>
        </div>
      </div>`;
    timeline.appendChild(group);
  });

  // Hide orphan era separators
  const children = [...timeline.children];
  for (let i = children.length - 1; i >= 0; i--) {
    if (children[i].classList.contains('era-separator')) {
      const next = children[i + 1];
      if (!next || next.classList.contains('era-separator')) children[i].style.display = 'none';
    }
  }
}

// ════════════════════════════════════════
// CSS-BASED FILTERING
// ════════════════════════════════════════
function applyFilters() {
  perfStart('applyFilters');

  const timeline = dom.timeline;
  const searchTerm = dom.searchInput.value.toLowerCase();
  const cfg = VENDOR_CONFIG[currentVendor];
  const isGpu = currentTechTab === 'gpu' && cfg.gpuData;

  const groups = timeline.querySelectorAll('.arch-group');

  groups.forEach(group => {
    let visible = true;

    if (isGpu) {
      // GPU filtering
      const gpuSegment = group.dataset.gpuSegment;
      const gpuForms = group.dataset.gpuForms; // Comma-separated list of form factors
      const searchText = group.dataset.searchText;

      // Segment filter
      if (activeGpuSegment !== 'all' && gpuSegment !== activeGpuSegment) {
        visible = false;
      }

      // Form factor filter
      if (visible && activeGpuFormFactor !== 'all') {
        const forms = gpuForms ? gpuForms.toLowerCase().split(',') : [];
        const hasMatchingForm = forms.some(form => {
          if (activeGpuFormFactor === 'pcie') return form.includes('pcie');
          if (activeGpuFormFactor === 'oam') return form.includes('oam');
          return false;
        });
        if (!hasMatchingForm) visible = false;
      }

      // Search filter
      if (visible && searchTerm && !searchText.includes(searchTerm)) {
        visible = false;
      }
    } else {
      // CPU filtering
      const segments = group.dataset.segments ? group.dataset.segments.split(',') : [];
      const brands = group.dataset.brands ? group.dataset.brands.split(',') : [];
      const searchText = group.dataset.searchText;

      // Segment filter
      if (activeSegmentTags.size > 0) {
        const hasMatchingSegment = segments.some(seg => activeSegmentTags.has(seg));
        if (!hasMatchingSegment) visible = false;
      }

      // Brand filter
      if (visible && activeBrandTags.size > 0) {
        const hasMatchingBrand = brands.some(brand => activeBrandTags.has(brand));
        if (!hasMatchingBrand) visible = false;
      }

      // Search filter
      if (visible && searchTerm) {
        // First check pre-built searchText
        let found = searchText.includes(searchTerm);

        // If not found, also search within CPU spec table data
        if (!found) {
          const specsSource = (currentVendor === 'amd' && AMD_CPU_SPECS) ? AMD_CPU_SPECS : (currentVendor === 'intel' && INTEL_CPU_SPECS) ? INTEL_CPU_SPECS : null;
          if (specsSource) {
            const skuCards = group.querySelectorAll('.sku-card');
            for (const skuCard of skuCards) {
              const skuName = skuCard.querySelector('.sku-name')?.textContent?.split(/\d+\sSKUs/)[0].trim();
              if (skuName && specsSource[skuName]) {
                const cpuModels = specsSource[skuName];
                if (cpuModels.some(m => m.n.toLowerCase().includes(searchTerm))) {
                  found = true;
                  break;
                }
              }
            }
          }
        }

        if (!found) visible = false;
      }
    }

    group.classList.toggle('hidden', !visible);

    // Filter individual SKU cards within visible groups
    if (visible && !isGpu) {
      const skuCards = group.querySelectorAll('.sku-card');
      let hasVisibleSku = false;

      skuCards.forEach(card => {
        let skuVisible = true;
        const skuTags = card.dataset.skuTags ? card.dataset.skuTags.split(',') : [];
        const skuBrand = card.dataset.skuBrand;

        // Segment filter for SKU cards
        if (activeSegmentTags.size > 0) {
          const hasMatchingTag = skuTags.some(tag => activeSegmentTags.has(tag));
          if (!hasMatchingTag) skuVisible = false;
        }

        // Brand filter for SKU cards
        if (skuVisible && activeBrandTags.size > 0) {
          if (!activeBrandTags.has(skuBrand)) skuVisible = false;
        }

        // Search filter for SKU cards
        if (skuVisible && searchTerm) {
          const cardText = card.textContent.toLowerCase();
          let found = cardText.includes(searchTerm);

          // If not found, also check CPU spec table data
          if (!found) {
            const specsSource = (currentVendor === 'amd' && AMD_CPU_SPECS) ? AMD_CPU_SPECS : (currentVendor === 'intel' && INTEL_CPU_SPECS) ? INTEL_CPU_SPECS : null;
            if (specsSource) {
              const skuName = card.querySelector('.sku-name')?.textContent?.split(/\d+\sSKUs/)[0].trim();
              if (skuName && specsSource[skuName]) {
                const cpuModels = specsSource[skuName];
                found = cpuModels.some(m => m.n.toLowerCase().includes(searchTerm));
              }
            }
          }

          if (!found) skuVisible = false;
        }

        card.classList.toggle('hidden', !skuVisible);

        // Also hide/show the associated spec wrapper
        const specWrapper = card.nextElementSibling;
        if (specWrapper && specWrapper.classList.contains('cpu-spec-wrapper')) {
          if (!skuVisible) {
            specWrapper.classList.remove('open');
            specWrapper.classList.add('hidden');
            card.classList.remove('selected');
          } else {
            specWrapper.classList.remove('hidden');
          }
        }

        if (skuVisible) hasVisibleSku = true;
      });

      // Hide the entire group if no SKU cards are visible
      if (!hasVisibleSku) {
        group.classList.add('hidden');
      }
    }
  });

  // Hide orphan era separators
  const children = [...timeline.children];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.classList.contains('era-separator')) {
      // Check if next sibling is visible
      let hasVisibleNext = false;
      for (let j = i + 1; j < children.length; j++) {
        if (children[j].classList.contains('era-separator')) break;
        if (!children[j].classList.contains('hidden')) {
          hasVisibleNext = true;
          break;
        }
      }
      child.classList.toggle('hidden', !hasVisibleNext);
    }
  }

  // Highlight matching rows in CPU spec tables
  highlightSearchMatches(searchTerm);

  perfEnd('applyFilters');
}

// Highlight CPU spec table rows that match the search term
function highlightSearchMatches(searchTerm) {
  // Clear all existing search highlights (but preserve manual selections)
  document.querySelectorAll('.cpu-spec-table tbody tr').forEach(row => {
    row.classList.remove('search-match');
  });

  // If no search term, we're done
  if (!searchTerm) return;

  // Highlight matching rows in CPU spec tables (works for all vendors)
  if ((currentVendor === 'amd' && AMD_CPU_SPECS) || (currentVendor === 'intel' && INTEL_CPU_SPECS)) {
    document.querySelectorAll('.cpu-spec-table tbody tr').forEach(row => {
      const modelNameCell = row.querySelector('.cpu-model-name');
      if (modelNameCell) {
        const modelName = modelNameCell.textContent.toLowerCase();
        if (modelName.includes(searchTerm)) {
          // Only add yellow highlight if not manually selected (green)
          if (!row.classList.contains('row-selected')) {
            row.classList.add('search-match');
          }
        }
      }
    });
  }
}

// Handle row selection in CPU spec tables
function setupRowSelectionHandlers() {
  // Use event delegation on document for dynamically added tables
  document.addEventListener('click', (e) => {
    const row = e.target.closest('.cpu-spec-table tbody tr');

    // If click is outside table AND on safe areas (timeline/container), clear selections
    if (!row && !e.target.closest('.cpu-spec-table')) {
      // Only clear if clicking on container or timeline (not buttons/controls)
      const clickedOnSafeArea = e.target.matches('.container, .timeline, .arch-group, .bg-grid') ||
                                 e.target.closest('.timeline, .arch-group');
      if (clickedOnSafeArea) {
        clearAllSelections();
      }
      return;
    }

    if (!row) return;

    // Toggle selection on click
    if (e.shiftKey) {
      // Shift+click: add to selection without deselecting others
      row.classList.add('row-selected');
      row.classList.remove('search-match'); // Remove yellow if present
    } else {
      // Normal click: toggle this row
      if (row.classList.contains('row-selected')) {
        row.classList.remove('row-selected');
      } else {
        row.classList.add('row-selected');
        row.classList.remove('search-match'); // Remove yellow if present
      }
    }
  });
}

// Clear all row selections
function clearAllSelections() {
  document.querySelectorAll('.cpu-spec-table tbody tr.row-selected').forEach(row => {
    row.classList.remove('row-selected');
  });
}

// ════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════
function toggleGroup(id) {
  expandedGroups.has(id) ? expandedGroups.delete(id) : expandedGroups.add(id);
  document.querySelector(`[data-id="${id}"]`)?.classList.toggle('expanded');
}
function toggleCpuSpecs(specId) {
  const wrapper = document.getElementById('cpu-spec-' + specId);
  if (wrapper) {
    const isOpening = !wrapper.classList.contains('open');
    const card = wrapper.previousElementSibling;
    const group = wrapper.closest('.arch-group');

    if (!group) return;

    // Get the skus-grid container
    const grid = group.querySelector('.skus-grid');
    if (!grid) return;

    // Clear all selected states and reset orders
    group.querySelectorAll('.sku-card.selected').forEach(c => c.classList.remove('selected'));
    group.querySelectorAll('.cpu-spec-wrapper').forEach(w => {
      w.style.removeProperty('--spec-order');
    });

    // Toggle the spec wrapper
    wrapper.classList.toggle('open');

    // Update the clicked card
    if (card) {
      const toggle = card.querySelector('.sku-spec-toggle');
      if (toggle) toggle.textContent = wrapper.classList.contains('open') ? '▴ Specs' : '▾ Specs';

      // Add selected state if opening
      if (isOpening) {
        card.classList.add('selected');

        // Calculate grid layout to position spec table after current row
        const allCards = Array.from(grid.querySelectorAll('.sku-card'));
        const cardIndex = allCards.indexOf(card);

        // Get grid column count from computed style
        const gridStyle = window.getComputedStyle(grid);
        const gridCols = gridStyle.gridTemplateColumns.split(' ').length;

        // Calculate which row this card is in (0-indexed)
        const cardRow = Math.floor(cardIndex / gridCols);

        // Calculate order value: place between last card of this row and first card of next row
        // Cards have order: 0, 2, 4, 6, 8, 10, ...
        // Last card in this row has order: (lastCardIndex * 2)
        // First card in next row has order: ((lastCardIndex + 1) * 2)
        // Place spec table in between with order: (lastCardIndex * 2) + 1
        const lastCardInRow = (cardRow + 1) * gridCols - 1;
        const orderValue = lastCardInRow * 2 + 1;

        wrapper.style.setProperty('--spec-order', orderValue);
      } else {
        card.classList.remove('selected');
      }
    }

    // Show/hide the collapse button for this arch-group
    updateCollapseBtn(group);
  }
}
function collapseAllSpecs(archId) {
  const group = document.querySelector(`[data-id="${archId}"]`);
  if (!group) return;
  // Clear all selected states
  group.querySelectorAll('.sku-card.selected').forEach(c => c.classList.remove('selected'));
  group.querySelectorAll('.cpu-spec-wrapper.open').forEach(w => {
    w.classList.remove('open');
    const card = w.previousElementSibling;
    if (card) {
      const toggle = card.querySelector('.sku-spec-toggle');
      if (toggle) toggle.textContent = '▾ Specs';
    }
  });
  updateCollapseBtn(group);
}
function updateCollapseBtn(group) {
  const btn = group.querySelector('.collapse-specs-btn');
  if (!btn) return;
  const hasOpen = group.querySelector('.cpu-spec-wrapper.open');
  btn.classList.toggle('visible', !!hasOpen);
}
function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function saveNotes(id, v) { try { localStorage.setItem(`roadmap-notes-${currentVendor}-${id}`, v); } catch(e) {} }
function loadNotes(id) { try { return localStorage.getItem(`roadmap-notes-${currentVendor}-${id}`) || ''; } catch(e) { return ''; } }
function getLinks(arch) {
  try { const s = localStorage.getItem(`roadmap-links-${currentVendor}-${arch.id}`); if (s !== null) return JSON.parse(s); } catch(e) {}
  return arch.defaultLinks || [];
}
function saveLinks(id, links) { try { localStorage.setItem(`roadmap-links-${currentVendor}-${id}`, JSON.stringify(links)); } catch(e) {} }
function showAddLinkForm(id) { document.getElementById(`add-link-form-${id}`).classList.add('visible'); document.getElementById(`link-label-${id}`).focus(); }
function hideAddLinkForm(id) { document.getElementById(`add-link-form-${id}`).classList.remove('visible'); document.getElementById(`link-label-${id}`).value = ''; document.getElementById(`link-url-${id}`).value = ''; }
function getActiveData() {
  const cfg = VENDOR_CONFIG[currentVendor];
  return (currentTechTab === 'gpu' && cfg.gpuData) ? cfg.gpuData : cfg.data;
}
function saveNewLink(id) {
  let label = document.getElementById(`link-label-${id}`).value.trim();
  let url = document.getElementById(`link-url-${id}`).value.trim();
  if (!url) return;
  if (!label) label = url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
  if (!/^https?:\/\//.test(url)) url = 'https://' + url;
  const arch = getActiveData().find(a => a.id === id);
  const links = getLinks(arch); links.push({ label, url }); saveLinks(id, links);
  hideAddLinkForm(id); expandedGroups.add(id); render();
}
function removeLink(id, idx) {
  const arch = getActiveData().find(a => a.id === id);
  const links = getLinks(arch); links.splice(idx, 1); saveLinks(id, links);
  expandedGroups.add(id); render();
}

// Init DOM cache and event listeners
initDomCache();
setupRowSelectionHandlers();

// Search (with debouncing for performance)
const debouncedFilter = debounce(applyFilters, 300);
dom.searchInput.addEventListener('input', () => {
  // Toggle clear button visibility
  dom.searchClear.classList.toggle('visible', dom.searchInput.value.length > 0);
  debouncedFilter();
});

// Clear search button
dom.searchClear.addEventListener('click', () => {
  dom.searchInput.value = '';
  dom.searchClear.classList.remove('visible');
  applyFilters();
});

// Expand/Collapse
dom.expandAllBtn.addEventListener('click', () => {
  const cfg = VENDOR_CONFIG[currentVendor];
  const data = (currentTechTab === 'gpu' && cfg.gpuData) ? cfg.gpuData : cfg.data;
  data.forEach(a => { if (a.id) expandedGroups.add(a.id); }); render();
});
dom.collapseAllBtn.addEventListener('click', () => { expandedGroups.clear(); render(); });
dom.clearSelectionsBtn.addEventListener('click', clearAllSelections);

// Init - Load AMD data on startup
switchVendor('amd').catch(error => {
  console.error('Failed to initialize:', error);
  dom.timeline.innerHTML = '<div class="error">Failed to load data. Please refresh the page.</div>';
});
