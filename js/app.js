document.addEventListener('DOMContentLoaded', async function() {
  // Load data (live from Apps Script or fallback)
  await initDashboard();

  initSummary();
  renderLegend();
  initMapInteractions();
});

function initSummary() {
  const stats = document.getElementById('summaryStats');
  const { summary } = dashboardData;

  let bankLoans = 0;
  let bcTotal = 0;
  dashboardData.blocks.forEach(block => {
    block.clfs.forEach(clf => {
      const fi = clf.interventions.fi;
      bankLoans += Number(fi.bankLoan) || 0;
      bcTotal += Number(fi.bc) || 0;
    });
  });

  stats.innerHTML = `
    <div class="stat-item">
      <span class="stat-value">${summary.blocks}</span>
      <span class="stat-label">Blocks</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${summary.clfs}</span>
      <span class="stat-label">CLFs</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${summary.vos.toLocaleString()}</span>
      <span class="stat-label">VOs</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${summary.shgs.toLocaleString()}</span>
      <span class="stat-label">Active SHGs</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${bankLoans.toLocaleString()}</span>
      <span class="stat-label">Bank Loans</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${bcTotal.toLocaleString()}</span>
      <span class="stat-label">BCs</span>
    </div>
  `;
}

function renderLegend() {
  const legendItems = document.getElementById('legendItems');
  const blockColors = {
    'Mawshynrut': '#14532d',
    'Nongstoin': '#166534',
    'Rambrai': '#15803d',
    'RI-Muliang': '#16a34a',
    'Shallang': '#22c55e'
  };

  legendItems.innerHTML = dashboardData.blocks.map(block => `
    <div class="legend-item">
      <div class="legend-color" style="background-color: ${blockColors[block.name] || '#ccc'}"></div>
      <span>${block.name} (${block.clfs.length} CLFs)</span>
    </div>
  `).join('');
}

function initMapInteractions() {
  const blockGroups = document.querySelectorAll('.block-group');

  blockGroups.forEach(group => {
    group.addEventListener('click', function() {
      const blockName = this.dataset.block;
      window.location.href = `block.html?block=${encodeURIComponent(blockName)}`;
    });

    group.addEventListener('mouseover', function() {
      const blockName = this.dataset.block;
      const block = dashboardData.blocks.find(b => b.name === blockName);
      if (block) {
        showBlockTooltip(this, block);
      }
    });

    group.addEventListener('mouseout', function() {
      hideTooltip();
    });

    group.addEventListener('mousemove', function(e) {
      const tooltip = document.getElementById('tooltip');
      if (tooltip && tooltip.style.display === 'block') {
        positionTooltip(e);
      }
    });
  });
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showBlockTooltip(element, block) {
  let tooltip = document.getElementById('tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);
  }

  const totalVo = block.clfs.reduce((sum, c) => sum + (c.vo || 0), 0);
  const totalShg = block.shgTotal != null ? block.shgTotal : block.clfs.reduce((sum, c) => sum + (c.shg || 0), 0);
  const totalVillages = block.clfs.reduce((sum, c) => sum + (c.villages || 0), 0);

  tooltip.innerHTML = `
    <div class="tooltip-title">${escapeHtml(block.name)} Block</div>
    <div class="tooltip-stats">
      <span>${block.clfs.length} CLFs</span>
      <span>${totalVillages} Villages</span>
      <span>${totalVo} VOs</span>
      <span>${totalShg} Active SHGs</span>
    </div>
  `;

  tooltip.style.display = 'block';
}

function hideTooltip() {
  const tooltip = document.getElementById('tooltip');
  if (tooltip) {
    tooltip.style.display = 'none';
  }
}

function positionTooltip(e) {
  const tooltip = document.getElementById('tooltip');
  if (!tooltip) return;

  const rect = tooltip.getBoundingClientRect();
  let x = e.clientX - rect.width / 2;
  let y = e.clientY - rect.height - 15;

  if (x < 10) x = 10;
  if (x + rect.width > window.innerWidth - 10) x = window.innerWidth - rect.width - 10;
  if (y < 10) y = e.clientY + 15;

  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
}
