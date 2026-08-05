document.addEventListener('DOMContentLoaded', async function() {
  // Load data (live from Apps Script or fallback)
  await initDashboard();

  const urlParams = new URLSearchParams(window.location.search);
  const blockName = urlParams.get('block');

  if (!blockName) {
    window.location.href = 'index.html';
    return;
  }

  const block = dashboardData.blocks.find(b => b.name === blockName);
  if (!block) {
    window.location.href = 'index.html';
    return;
  }

  document.title = `${block.name} - WKH Dashboard`;
  document.getElementById('blockName').textContent = block.name + ' Block';

  const totalVo = block.clfs.reduce((sum, c) => sum + c.vo, 0);
  const totalShg = block.clfs.reduce((sum, c) => sum + c.shg, 0);
  const totalVillages = block.clfs.reduce((sum, c) => sum + (c.villages || 0), 0);
  const actualCount = block.clfs.filter(c => c.shgActual).length;
  const totalActual = block.clfs.reduce((sum, c) => sum + (parseInt(c.shgActual, 10) || 0), 0);

  document.getElementById('blockSubtitle').textContent = `${block.clfs.length} Cluster Level Federations`;
  document.getElementById('blockSummary').innerHTML = `
    <div class="stat-item">
      <span class="stat-value">${block.clfs.length}</span>
      <span class="stat-label">CLFs</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${totalVillages}</span>
      <span class="stat-label">Villages</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${totalVo}</span>
      <span class="stat-label">VOs</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${totalShg}</span>
      <span class="stat-label">SHGs</span>
    </div>
    ${actualCount ? `
    <div class="stat-item">
      <span class="stat-value">${totalActual}</span>
      <span class="stat-label">SHG (Actual)</span>
    </div>` : ''}
  `;

  renderCLFs(block);
  initModal();
});

function renderCLFs(block) {
  const grid = document.getElementById('clfGrid');

  grid.innerHTML = block.clfs.map((clf, index) => {
    const metaParts = [];
    if (clf.address) metaParts.push(`<span class="clf-meta-item">&#x1F4CD; ${clf.address}</span>`);
    if (clf.landStatus) metaParts.push(`<span class="clf-meta-item">&#x1F3E0; ${clf.landStatus}</span>`);

    return `
    <div class="clf-card" data-index="${index}">
      <div class="clf-header">
        <h3 class="clf-name">${clf.name}</h3>
        <div class="clf-counts">
          <div class="count-badge vill">
            <span class="count-icon">&#x1F3E1;</span>
            <span class="count-value">${clf.villages || 0}</span>
            <span class="count-label">Villages</span>
          </div>
          <div class="count-badge vo">
            <span class="count-icon">&#x1F4CA;</span>
            <span class="count-value">${clf.vo}</span>
            <span class="count-label">VOs</span>
          </div>
          <div class="count-badge shg">
            <span class="count-icon">&#x1F465;</span>
            <span class="count-value">${clf.shg}</span>
            <span class="count-label">SHGs</span>
          </div>
          ${clf.shgActual ? `
          <div class="count-badge actual">
            <span class="count-icon">&#x2705;</span>
            <span class="count-value">${clf.shgActual}</span>
            <span class="count-label">SHG (Actual)</span>
          </div>` : ''}
        </div>
      </div>
      ${metaParts.length ? `<div class="clf-meta">${metaParts.join('')}</div>` : ''}
      <div class="intervention-buttons">
        <button class="intervention-btn farm" data-clf="${index}" data-type="farm">
          <span class="btn-icon">&#x1F33E;</span>
          <span class="btn-text">Farm</span>
        </button>
        <button class="intervention-btn nonfarm" data-clf="${index}" data-type="nonFarm">
          <span class="btn-icon">&#x1F4B0;</span>
          <span class="btn-text">Non-Farm</span>
        </button>
        <button class="intervention-btn fi" data-clf="${index}" data-type="fi">
          <span class="btn-icon">&#x1F4CA;</span>
          <span class="btn-text">FI</span>
        </button>
        <button class="intervention-btn sisd" data-clf="${index}" data-type="sisd">
          <span class="btn-icon">&#x1F3E5;</span>
          <span class="btn-text">SISD</span>
        </button>
      </div>
    </div>
  `;
  }).join('');

  grid.querySelectorAll('.intervention-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const clfIndex = parseInt(this.dataset.clf);
      const type = this.dataset.type;
      showInterventionModal(block.clfs[clfIndex], type);
    });
  });
}

function initModal() {
  const modal = document.getElementById('interventionModal');
  const closeBtn = document.getElementById('modalClose');

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

function showInterventionModal(clf, type) {
  const modal = document.getElementById('interventionModal');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');

  const typeLabels = {
    farm: 'Farm Intervention',
    nonFarm: 'Non-Farm Intervention',
    fi: 'FI Intervention',
    sisd: 'SISD Intervention'
  };

  title.textContent = `${clf.name} - ${typeLabels[type]}`;

  const intervention = clf.interventions[type] || { name: '', brief: '', image: '' };

  if (type === 'sisd') {
    body.innerHTML = renderSisdBody(intervention);
  } else if (!intervention.name && !intervention.brief && !intervention.image) {
    body.innerHTML = `
      <div class="intervention-detail">
        <div class="intervention-placeholder">
          <span class="placeholder-icon">&#x1F4CB;</span>
          <p>Intervention data pending</p>
          <p class="placeholder-hint">Add data to the Google Sheet to populate this section</p>
        </div>
      </div>
    `;
  } else {
    const nameRow = intervention.name
      ? `<div class="detail-row">
           <span class="detail-label">Intervention Name:</span>
           <span class="detail-value">${escapeHtml(intervention.name)}</span>
         </div>`
      : '';

    const briefRow = intervention.brief
      ? `<div class="detail-row">
           <span class="detail-label">Brief on Programme:</span>
           <span class="detail-value">${escapeHtml(intervention.brief)}</span>
         </div>`
      : '';

    body.innerHTML = `
      <div class="intervention-detail">
        ${nameRow}
        ${briefRow}
        <div class="detail-image">
          ${buildInterventionImage(intervention.image, intervention.name)}
        </div>
      </div>
    `;
  }

  modal.classList.add('active');
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSisdBody(sisd) {
  const rows = [];
  if (sisd.childCare) rows.push(['Child Care Support (children)', sisd.childCare]);
  if (sisd.transitHome) rows.push(['Transit Home', sisd.transitHome]);
  if (sisd.followUp) rows.push(['Follow up of High Risk & Pregnant Mothers', sisd.followUp]);
  if (sisd.vrf) rows.push(['Provided with VRF to SAM/MAM', sisd.vrf]);

  if (rows.length === 0) {
    return `<div class="intervention-detail">
      <div class="intervention-placeholder">
        <span class="placeholder-icon">&#x1F4CB;</span>
        <p>SISD data pending</p>
        <p class="placeholder-hint">Add data to the Google Sheet to populate this section</p>
      </div>
    </div>`;
  }

  return `<div class="intervention-detail">
    ${rows.map(pair => `
      <div class="detail-row">
        <span class="detail-label">${escapeHtml(pair[0])}:</span>
        <span class="detail-value">${escapeHtml(pair[1])}</span>
      </div>`).join('')}
  </div>`;
}

function getDriveFolderId(url) {
  const m = (url || '').match(/drive\.google\.com\/(?:drive\/)?(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : '';
}

function getDriveFileId(url) {
  let m = (url || '').match(/drive\.google\.com\/uc\?export=view&id=([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  m = (url || '').match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : '';
}

function buildInterventionImage(image, name) {
  const imageText = escapeHtml(image || '');
  const altText = escapeHtml(name || 'Intervention');

  if (!imageText) {
    return `<div class="intervention-placeholder">
             <span class="placeholder-icon">&#x1F5BC;</span>
             <p>No image available</p>
           </div>`;
  }

  const folderId = getDriveFolderId(imageText);
  if (folderId) {
    return `<div class="folder-embed-wrapper">
             <iframe src="https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#grid"
                     width="100%" height="320" frameborder="0" scrolling="yes"
                     title="${altText}" class="folder-embed"></iframe>
             <a href="${imageText}" target="_blank" rel="noopener noreferrer" class="folder-link">
               &#x1F4C1; Open photo folder in Google Drive
             </a>
           </div>`;
  }

  const fileId = getDriveFileId(imageText);
  const src = fileId ? 'https://drive.google.com/uc?export=view&id=' + encodeURIComponent(fileId) : imageText;

  return `<img src="${src}" alt="${altText}" class="intervention-image" referrerpolicy="no-referrer"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="intervention-placeholder" style="display:none;">
            <span class="placeholder-icon">&#x1F5BC;</span>
            <p>Image could not be loaded</p>
          </div>`;
}

function closeModal() {
  document.getElementById('interventionModal').classList.remove('active');
}
