document.addEventListener('DOMContentLoaded', function() {
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

  document.getElementById('blockSubtitle').textContent = `${block.clfs.length} Cluster Level Federations`;
  document.getElementById('blockSummary').innerHTML = `
    <div class="stat-item">
      <span class="stat-value">${block.clfs.length}</span>
      <span class="stat-label">CLFs</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${totalVo}</span>
      <span class="stat-label">VOs</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${totalShg}</span>
      <span class="stat-label">SHGs</span>
    </div>
  `;

  renderCLFs(block);
  initModal();
});

function renderCLFs(block) {
  const grid = document.getElementById('clfGrid');

  grid.innerHTML = block.clfs.map((clf, index) => `
    <div class="clf-card" data-index="${index}">
      <div class="clf-header">
        <h3 class="clf-name">${clf.name}</h3>
        <div class="clf-counts">
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
        </div>
      </div>
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
      </div>
    </div>
  `).join('');

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
    fi: 'FI Intervention'
  };

  title.textContent = `${clf.name} - ${typeLabels[type]}`;

  const intervention = clf.interventions[type];

  if (!intervention.name && !intervention.brief) {
    body.innerHTML = `
      <div class="intervention-detail">
        <div class="intervention-placeholder">
          <span class="placeholder-icon">&#x1F4CB;</span>
          <p>Intervention data pending</p>
        </div>
      </div>
    `;
  } else {
    const imageHtml = intervention.image
      ? `<img src="${intervention.image}" alt="${intervention.name}" class="intervention-image">`
      : `<div class="intervention-placeholder">
           <span class="placeholder-icon">&#x1F5BC;</span>
           <p>Image not available</p>
         </div>`;

    body.innerHTML = `
      <div class="intervention-detail">
        <div class="detail-row">
          <span class="detail-label">Intervention Name:</span>
          <span class="detail-value">${intervention.name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Brief on Programme:</span>
          <span class="detail-value">${intervention.brief}</span>
        </div>
        <div class="detail-image">
          ${imageHtml}
        </div>
      </div>
    `;
  }

  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('interventionModal').classList.remove('active');
}
