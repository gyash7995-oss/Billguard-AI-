/**
 * BuildGuard AI - Construction Material Intelligence Platform
 * Frontend Application Logic & Simulation Engine
 */

// Application State
const state = {
  currentTab: 'dashboard',
  selectedSite: 'Site A — Main Project',
  siteSubtitle: 'Main Construction Site',
  activeAlertVisible: true,
  alertsCount: 3,
  aiBoxesVisible: true,
  activeCamera: 'cam02',
  cctvAnimationId: null,
  activeAlertsList: [
    {
      id: 'ALT-8840',
      time: '02:13 PM',
      type: 'Unaccounted Movement',
      material: 'Cement Bags (Ultratech 53G)',
      quantity: '3 bags',
      vector: 'Storage Area → Site Exit',
      exposure: '₹1,260',
      status: 'Requires Verification',
      severity: 'high'
    },
    {
      id: 'ALT-8839',
      time: '01:05 PM',
      type: 'Unaccounted Movement',
      material: 'TMT Rebar 12mm',
      quantity: '2 bundles',
      vector: 'Work Zone B → Periphery Wall',
      exposure: '₹2,940',
      status: 'Requires Verification',
      severity: 'high'
    },
    {
      id: 'ALT-8835',
      time: '11:30 AM',
      type: 'Material Wastage Spike',
      material: 'Glazed Vitrified Tiles',
      quantity: '4 damaged boxes',
      vector: 'Loading Bay Handling',
      exposure: '₹3,360',
      status: 'Logged as Scrap',
      severity: 'medium'
    }
  ],
  liveFeedEvents: [
    { time: '02:13:42 PM', text: 'ANOMALY: 3 cement bags tracked toward Site Exit Gate. No gate pass match found.', highlight: true, cam: 'CAM 02' },
    { time: '02:10:15 PM', text: 'Reconciliation: 10 cement bags issued to Work Zone A verified against REQ-2026-081.', highlight: false, cam: 'CAM 01' },
    { time: '01:45:00 PM', text: 'Truck MH-12-RN-8812 entered Loading Bay with 200 bags PPC Cement.', highlight: false, cam: 'CAM 04' },
    { time: '01:05:22 PM', text: 'FLAGGED: 2 bundles TMT Rebar moved past perimeter sensor Zone B.', highlight: true, cam: 'CAM 03' },
    { time: '12:18:04 PM', text: 'Material Movement: 5 Steel Bars transferred to Work Zone B (Authorized).', highlight: false, cam: 'CAM 01' }
  ]
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  initLiveFeeds();
  startCctvSimulation();
  renderEvidenceSnapshot();
  setupClickOutside();

  const hash = window.location.hash.replace('#', '');
  if (hash) {
    switchTab(hash);
  }
});

// Navigation Handling
function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab-item');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      switchTab(target);
    });
  });
}

function switchTab(tabId) {
  state.currentTab = tabId;

  // Update nav buttons
  document.querySelectorAll('.nav-tab-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  // Update views
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active-view');
  });

  const activeView = document.getElementById(`view-${tabId}`);
  if (activeView) {
    activeView.classList.add('active-view');
  }

  // Smooth scroll to top of view
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Trigger redraw if canvas view
  if (tabId === 'live') {
    setTimeout(drawSingleCamera, 50);
  }
}

// Site Switcher
function toggleSiteDropdown() {
  const menu = document.getElementById('siteDropdownMenu');
  const notifMenu = document.getElementById('notifDropdownMenu');
  if (notifMenu) notifMenu.classList.remove('active');
  if (menu) menu.classList.toggle('active');
}

function selectSite(siteName, subtitle) {
  state.selectedSite = siteName;
  state.siteSubtitle = subtitle;
  
  const siteLabel = document.getElementById('selectedSiteName');
  const headerLabel = document.getElementById('headerSiteLabel');
  
  if (siteLabel) siteLabel.textContent = siteName;
  if (headerLabel) headerLabel.textContent = `${siteName} — ${subtitle}`;

  document.querySelectorAll('#siteDropdownMenu .dropdown-item').forEach(item => {
    item.classList.toggle('active', item.querySelector('.dropdown-item-title').textContent === siteName);
  });

  const menu = document.getElementById('siteDropdownMenu');
  if (menu) menu.classList.remove('active');

  showToast(`Switched active view to ${siteName}`);
}

// Notifications Panel
function toggleNotifPanel() {
  const notifMenu = document.getElementById('notifDropdownMenu');
  const siteMenu = document.getElementById('siteDropdownMenu');
  if (siteMenu) siteMenu.classList.remove('active');
  if (notifMenu) notifMenu.classList.toggle('active');
}

function markAllNotifsRead() {
  const notifMenu = document.getElementById('notifDropdownMenu');
  if (notifMenu) notifMenu.classList.remove('active');
  const badge = document.querySelector('.btn-badge-dot');
  if (badge) badge.style.display = 'none';
  showToast('All notifications marked as reviewed');
}

// Click outside handling for dropdowns
function setupClickOutside() {
  document.addEventListener('click', (e) => {
    const siteDropdown = document.getElementById('siteDropdownMenu');
    const siteBtn = document.getElementById('siteSelectorBtn');
    const notifDropdown = document.getElementById('notifDropdownMenu');
    const notifBtn = document.getElementById('notifBellBtn');

    if (siteDropdown && siteBtn && !siteBtn.contains(e.target) && !siteDropdown.contains(e.target)) {
      siteDropdown.classList.remove('active');
    }
    if (notifDropdown && notifBtn && !notifBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
      notifDropdown.classList.remove('active');
    }
  });

  // ESC key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeEvidenceModalDirect();
    }
  });
}

// Active Alert Dismissal
function dismissActiveAlert() {
  const alertCard = document.getElementById('cardActiveAlert');
  if (alertCard) {
    alertCard.style.transition = 'all 0.3s ease';
    alertCard.style.opacity = '0';
    alertCard.style.transform = 'scale(0.95)';
    setTimeout(() => {
      alertCard.style.display = 'none';
      state.activeAlertVisible = false;
      state.alertsCount = Math.max(0, state.alertsCount - 1);
      updateAlertBadges();
      showToast('Active alert dismissed from top summary (Record preserved in Alerts queue)');
    }, 300);
  }
}

function updateAlertBadges() {
  const badge = document.getElementById('alertsCounter');
  if (badge) badge.textContent = state.alertsCount;
}

// Evidence Modal Controls
function openEvidenceModal() {
  const modal = document.getElementById('evidenceModal');
  if (modal) {
    modal.classList.add('active');
    const evVid = document.getElementById('evidenceSnapshotVideo');
    if (evVid) {
      evVid.play().catch(() => {});
    }
    renderEvidenceSnapshot();
  }
}

function closeEvidenceModal(e) {
  if (e.target.id === 'evidenceModal') {
    closeEvidenceModalDirect();
  }
}

function closeEvidenceModalDirect() {
  const modal = document.getElementById('evidenceModal');
  if (modal) {
    modal.classList.remove('active');
    const evVid = document.getElementById('evidenceSnapshotVideo');
    if (evVid) {
      evVid.pause();
    }
  }
}

function verifyAndEscalate() {
  closeEvidenceModalDirect();
  showToast('✓ Incident #EV-2026-0929-3 verified & escalated to Chief Project Engineer');
}

function markIncidentAuthorized() {
  closeEvidenceModalDirect();
  showToast('Incident marked as Authorized Subcontractor Dispatch');
}

function flagFalsePositive() {
  closeEvidenceModalDirect();
  showToast('Flagged as False Positive: Feedback dispatched to YOLOv8 Edge Model training dataset');
}

// Toast System - Supports Dark Burgundy Error/Alert Style (like 2nd image)
function showToast(message, isError = false) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const isAlert = isError || message.includes('🚨') || message.includes('Alert') || message.includes('Unaccounted') || message.includes('ANOMALY') || message.includes('Security');
  
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  
  if (isAlert) {
    toast.style.background = '#2b1219';
    toast.style.border = '1px solid rgba(244, 63, 94, 0.4)';
    toast.style.color = '#ffffff';
    toast.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.35)';
    toast.innerHTML = `
      <div style="width: 20px; height: 20px; border-radius: 50%; background: #f43f5e; color: #ffffff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 5px rgba(244, 63, 94, 0.4);">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
      <span style="font-size: 13px; font-weight: 600;">${message}</span>
    `;
  } else {
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <span>${message}</span>
    `;
  }

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Live Events Stream
function initLiveFeeds() {
  const container = document.getElementById('liveEventFeedContainer');
  if (!container) return;

  container.innerHTML = state.liveFeedEvents.map(evt => `
    <div class="live-feed-card ${evt.highlight ? 'highlight-feed' : ''}">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <strong style="color: ${evt.highlight ? '#ea580c' : '#2563eb'}; font-size: 11px;">${evt.cam}</strong>
        <span style="color: #64748b; font-size: 11px;">${evt.time}</span>
      </div>
      <p style="color: #1e293b; line-height: 1.4;">${evt.text}</p>
    </div>
  `).join('');
}

function simulateNewDetection() {
  const newEvt = {
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    text: 'YOLOv8 Edge: Pallet movement identified at Storage Gate 1. ByteTrack ID #512 generated.',
    highlight: false,
    cam: 'CAM 01'
  };
  state.liveFeedEvents.unshift(newEvt);
  initLiveFeeds();
  showToast('New simulated AI detection event captured on CAM 01');
}

function toggleBoundingBoxes() {
  state.aiBoxesVisible = !state.aiBoxesVisible;
  const btn = document.getElementById('btnToggleBoxes');
  if (btn) btn.textContent = state.aiBoxesVisible ? 'Hide AI Overlays' : 'Show AI Overlays';
  showToast(`AI Overlays ${state.aiBoxesVisible ? 'Enabled' : 'Disabled'}`);
}

// Export CSV Movement Audit Log
function exportMovementReport() {
  const csvContent = "data:text/csv;charset=utf-8," 
    + "Time,Movement ID,Material,Quantity,Origin,Destination,Requisition,Status\n"
    + "03:40 PM,#MOV-8841,Tile Boxes,2,Storage,Work Zone A,REQ-2026-088,Verified\n"
    + "02:13 PM,#MOV-8840,Cement Bags,3,Storage Area,Site Exit,None,Unaccounted\n"
    + "12:18 PM,#MOV-8839,Steel Bars,5,Storage,Work Zone B,REQ-2026-085,Verified\n"
    + "10:42 AM,#MOV-8838,Cement Bags,10,Storage,Work Zone A,REQ-2026-081,Verified\n";

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `BuildGuard_Movement_Audit_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Movement Audit Trail CSV exported successfully');
}

// Alerts filtering
function filterAlerts(category) {
  const tbody = document.getElementById('alertsTableBody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  rows.forEach(row => {
    if (category === 'all') {
      row.style.display = '';
    } else if (category === 'unaccounted') {
      row.style.display = row.textContent.includes('Unaccounted') ? '' : 'none';
    } else if (category === 'wastage') {
      row.style.display = row.textContent.includes('Wastage') ? '' : 'none';
    }
  });
  showToast(`Filtering alerts by: ${category.toUpperCase()}`);
}

// ============================================================================
// Real-time Canvas Rendering for Single Prominent Camera & Live Report Engine
// ============================================================================
let tick = 0;

function startCctvSimulation() {
  function loop() {
    tick += 0.035;
    drawSingleCamera();
    updateLiveClock();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

function updateLiveClock() {
  const clockEl = document.getElementById('cctvLiveClock');
  if (!clockEl) return;
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0] + ' IST';
  clockEl.textContent = `2026-09-29 ${timeStr}`;
}

// Draw the Single Active Camera Screen
function drawSingleCamera() {
  const canvas = document.getElementById('activeSingleCctvCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  // Dispatch to active camera renderer
  if (state.activeCamera === 'cam02') {
    renderCam02ExitGate(ctx, w, h);
  } else if (state.activeCamera === 'cam01') {
    renderCam01StorageYard(ctx, w, h);
  } else if (state.activeCamera === 'cam03') {
    renderCam03TowerFoundation(ctx, w, h);
  } else if (state.activeCamera === 'cam04') {
    renderCam04VehicleBay(ctx, w, h);
  }
}

// Helper for drawing YOLO corner reticles
function drawYoloCorners(ctx, x, y, w, h, color) {
  const len = 12;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(x, y + h - len); ctx.lineTo(x, y + h); ctx.lineTo(x + len, y + h);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(x + w - len, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - len);
  ctx.stroke();
}

// CAM 02: Site Exit Gate (Real Video Feed from videoo.mp4 + YOLOv8 AI Overlay)
function renderCam02ExitGate(ctx, w, h) {
  // Clear canvas so the real video playing underneath is visible
  ctx.clearRect(0, 0, w, h);

  const videoEl = document.getElementById('activeSingleCctvVideo');
  if (videoEl && videoEl.paused) {
    videoEl.play().catch(() => {});
  }

  if (state.aiBoxesVisible) {
    // Red Anomaly Bounding Box on construction materials / foundation
    const pulseAlpha = 0.75 + Math.sin(tick * 4) * 0.25;
    const boxX = w * 0.38 + Math.sin(tick * 0.5) * 15;
    const boxY = h * 0.38;
    const boxW = 230;
    const boxH = 150;

    ctx.strokeStyle = `rgba(244, 63, 94, ${pulseAlpha})`;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    drawYoloCorners(ctx, boxX, boxY, boxW, boxH, '#f43f5e');

    // Label tag (styled like modern YOLO / ByteTrack HUD)
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(boxX, boxY - 24, 255, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('ANOMALY: 3x cement_bag [94.6%] #BT-491', boxX + 6, boxY - 8);

    // Secondary tracking box (Worker / Handler)
    const workerX = boxX - 95;
    const workerY = boxY + 12;
    const workerW = 75;
    const workerH = 135;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(workerX, workerY, workerW, workerH);
    drawYoloCorners(ctx, workerX, workerY, workerW, workerH, '#3b82f6');
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(workerX, workerY - 20, 135, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('person: 0.96 [ID: 12]', workerX + 5, workerY - 6);

    // Virtual Perimeter Tripwire across Exit
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(40, h - 70);
    ctx.lineTo(w - 40, h - 70);
    ctx.stroke();
    ctx.setLineDash([]);

    // Trajectory dashed vector toward Exit Gate
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(boxX + boxW / 2, boxY + boxH / 2);
    ctx.lineTo(w - 120, h - 70);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Scanline overlay for subtle cinema-grade CCTV feel
  drawScanlines(ctx, w, h);
}

// CAM 01: Material Storage Yard
function renderCam01StorageYard(ctx, w, h) {
  ctx.fillStyle = '#1a2232';
  ctx.fillRect(0, 0, w, h);

  // Concrete grid
  ctx.strokeStyle = '#273447';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }

  // Pallet stacks
  ctx.fillStyle = '#64748b';
  ctx.fillRect(120, 200, 260, 160);
  ctx.fillStyle = '#475569';
  ctx.fillRect(140, 220, 220, 40);
  ctx.fillRect(140, 270, 220, 40);
  ctx.fillRect(140, 320, 220, 30);

  // Worker
  const workerX = 540 + Math.sin(tick * 0.7) * 50;
  const workerY = 260;
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(workerX, workerY - 25, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(workerX - 12, workerY - 10, 24, 45);

  if (state.aiBoxesVisible) {
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.strokeRect(110, 190, 280, 180);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('cement_pallet: 0.98 (200 Bags PPC)', 115, 180);

    ctx.strokeStyle = '#3b82f6';
    ctx.strokeRect(workerX - 20, workerY - 40, 40, 80);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('person: 0.96 [ID: 12]', workerX - 20, workerY - 45);
  }

  drawScanlines(ctx, w, h);
}

// CAM 03: Tower 1 Foundation
function renderCam03TowerFoundation(ctx, w, h) {
  ctx.fillStyle = '#171f2c';
  ctx.fillRect(0, 0, w, h);

  // Tower structural beams
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(220, 30); ctx.lineTo(220, h - 30);
  ctx.moveTo(460, 30); ctx.lineTo(460, h - 30);
  ctx.moveTo(220, 140); ctx.lineTo(460, 260);
  ctx.moveTo(460, 140); ctx.lineTo(220, 260);
  ctx.stroke();

  // Crane hook oscillating
  const hookX = 640 + Math.sin(tick * 1.2) * 40;
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(hookX, 0);
  ctx.lineTo(hookX, 180);
  ctx.stroke();

  if (state.aiBoxesVisible) {
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.strokeRect(hookX - 25, 160, 50, 50);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('crane_payload: safe 0.96', hookX - 50, 150);
  }

  drawScanlines(ctx, w, h);
}

// CAM 04: Heavy Vehicle Bay
function renderCam04VehicleBay(ctx, w, h) {
  ctx.fillStyle = '#141d2a';
  ctx.fillRect(0, 0, w, h);

  // Truck silhouette
  ctx.fillStyle = '#334155';
  ctx.fillRect(180, 160, 460, 200);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(520, 190, 140, 160);

  // Wheels
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(260, 380, 32, 0, Math.PI * 2);
  ctx.arc(380, 380, 32, 0, Math.PI * 2);
  ctx.arc(600, 380, 32, 0, Math.PI * 2);
  ctx.fill();

  if (state.aiBoxesVisible) {
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(170, 150, 500, 240);
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('carrier_truck: 0.95 [MH-12-RN-8812]', 175, 140);
  }

  drawScanlines(ctx, w, h);
}

// Switch Active Single Camera
function switchSingleCamera(camId) {
  state.activeCamera = camId;

  // Toggle video element for CAM 02 vs Canvas simulation for other cameras
  const vid = document.getElementById('activeSingleCctvVideo');
  if (vid) {
    if (camId === 'cam02') {
      vid.style.display = 'block';
      vid.play().catch(() => {});
    } else {
      vid.style.display = 'none';
      vid.pause();
    }
  }

  // Update switcher chips
  document.querySelectorAll('.cam-select-chip').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeChip = document.getElementById(`chip${camId.charAt(0).toUpperCase() + camId.slice(1)}`);
  if (activeChip) activeChip.classList.add('active');

  // Update Camera HUD
  const hudTitle = document.getElementById('cctvHudCamTitle');
  const alertOverlay = document.getElementById('cctvAlertOverlay');

  const camMeta = {
    cam02: { name: 'CAM 02 — Main Site Exit Gate', hasAlert: true },
    cam01: { name: 'CAM 01 — Material Storage Yard', hasAlert: false },
    cam03: { name: 'CAM 03 — Tower 1 Foundation', hasAlert: false },
    cam04: { name: 'CAM 04 — Heavy Vehicle Bay', hasAlert: false }
  };

  const current = camMeta[camId] || camMeta.cam02;
  if (hudTitle) hudTitle.textContent = current.name;
  if (alertOverlay) alertOverlay.style.display = current.hasAlert ? 'flex' : 'none';

  // Update Right-Side Live Report
  updateCameraLiveReport(camId);
  showToast(`Switched active camera view to: ${current.name}`);
}

// Update the Right-Side Live Report of What is Happening on That Camera
function updateCameraLiveReport(camId) {
  const titleEl = document.getElementById('reportCamTitle');
  const subEl = document.getElementById('reportCamSubtitle');
  const statusTextEl = document.getElementById('reportLiveStatusText');
  const zoneValEl = document.getElementById('reportZoneStatusVal');
  const detListEl = document.getElementById('reportDetectionItemsList');
  const erpBanner = document.getElementById('reportErpBanner');
  const erpTitle = document.getElementById('reportErpTitle');
  const erpExposure = document.getElementById('reportErpExposure');
  const erpDesc = document.getElementById('reportErpDesc');
  const timelineEl = document.getElementById('reportCameraTimelineList');

  if (camId === 'cam02') {
    if (titleEl) titleEl.textContent = 'Live Report: CAM 02';
    if (subEl) subEl.textContent = 'South Exit Gate • Physical Egress Monitoring';
    if (statusTextEl) statusTextEl.textContent = 'ANOMALY DETECTED';
    if (zoneValEl) {
      zoneValEl.textContent = 'Breach Flagged';
      zoneValEl.className = 'chip-val status-val-alert';
    }

    if (detListEl) {
      detListEl.innerHTML = `
        <div class="detection-item-row">
          <div class="item-name-tag">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #ea580c; display: inline-block;"></span>
            <span>3x Cement Bags (Ultratech 53G)</span>
          </div>
          <span class="item-conf-badge">94.6%</span>
        </div>
        <div class="detection-item-row">
          <div class="item-name-tag">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; display: inline-block;"></span>
            <span>1x Hand Utility Cart</span>
          </div>
          <span class="item-conf-badge">92.1%</span>
        </div>
        <div class="detection-item-row">
          <div class="item-name-tag">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
            <span>1x Handler / Worker (Vest #12)</span>
          </div>
          <span class="item-conf-badge">96.2%</span>
        </div>
      `;
    }

    if (erpBanner) {
      erpBanner.style.background = '#2b1219';
      erpBanner.style.borderColor = 'rgba(244, 63, 94, 0.4)';
    }
    if (erpTitle) erpTitle.textContent = 'ERP Reconciliation: Mismatch';
    if (erpExposure) erpExposure.textContent = '₹1,260';
    if (erpDesc) erpDesc.textContent = 'No digital gate pass issued for this interval (01:45 PM – 02:30 PM). Flagged as unauthorized removal.';

    if (timelineEl) {
      timelineEl.innerHTML = `
        <div class="timeline-event-item event-alert">
          <span class="timeline-time">02:13:42 PM</span>
          <span>Perimeter Line Crossed: 3 bags moved toward Exit without pass.</span>
        </div>
        <div class="timeline-event-item">
          <span class="timeline-time">02:12:48 PM</span>
          <span>ByteTrack #BT-491 acquired from storage corridor.</span>
        </div>
        <div class="timeline-event-item">
          <span class="timeline-time">02:08:15 PM</span>
          <span>Worker ID #12 passed checkpoint (Authorized).</span>
        </div>
      `;
    }
  } else if (camId === 'cam01') {
    if (titleEl) titleEl.textContent = 'Live Report: CAM 01';
    if (subEl) subEl.textContent = 'Material Storage Yard • Central Staging Area';
    if (statusTextEl) statusTextEl.textContent = 'TELEMETRY NORMAL';
    if (zoneValEl) {
      zoneValEl.textContent = 'Compliant';
      zoneValEl.className = 'chip-val';
      zoneValEl.style.color = '#10b981';
    }

    if (detListEl) {
      detListEl.innerHTML = `
        <div class="detection-item-row">
          <div class="item-name-tag">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
            <span>2x Cement Pallets (200 Bags PPC)</span>
          </div>
          <span class="item-conf-badge">98.4%</span>
        </div>
        <div class="detection-item-row">
          <div class="item-name-tag">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; display: inline-block;"></span>
            <span>1x Staging Worker ID #12</span>
          </div>
          <span class="item-conf-badge">95.8%</span>
        </div>
      `;
    }

    if (erpBanner) {
      erpBanner.style.background = '#15241b';
      erpBanner.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    }
    if (erpTitle) erpTitle.textContent = 'ERP Reconciliation: Verified';
    if (erpExposure) erpExposure.textContent = '₹0 Exposure';
    if (erpDesc) erpDesc.textContent = 'Matched authorized transfer requisition #REQ-2026-081 (10 bags issued to Work Zone A).';

    if (timelineEl) {
      timelineEl.innerHTML = `
        <div class="timeline-event-item">
          <span class="timeline-time">02:10:15 PM</span>
          <span>Reconciliation: 10 bags verified against REQ-2026-081.</span>
        </div>
        <div class="timeline-event-item">
          <span class="timeline-time">01:15:00 PM</span>
          <span>Routine inventory stack scan verified.</span>
        </div>
      `;
    }
  } else if (camId === 'cam03') {
    if (titleEl) titleEl.textContent = 'Live Report: CAM 03';
    if (subEl) subEl.textContent = 'Tower 1 Foundation • Active Structural Pour';
    if (statusTextEl) statusTextEl.textContent = 'TELEMETRY NORMAL';
    if (zoneValEl) {
      zoneValEl.textContent = 'Compliant';
      zoneValEl.className = 'chip-val';
      zoneValEl.style.color = '#10b981';
    }

    if (detListEl) {
      detListEl.innerHTML = `
        <div class="detection-item-row">
          <div class="item-name-tag">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
            <span>Crane Payload Hook (Safe Load)</span>
          </div>
          <span class="item-conf-badge">96.0%</span>
        </div>
        <div class="detection-item-row">
          <div class="item-name-tag">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; display: inline-block;"></span>
            <span>5x TMT Rebar Bundles</span>
          </div>
          <span class="item-conf-badge">93.4%</span>
        </div>
      `;
    }

    if (erpBanner) {
      erpBanner.style.background = '#15241b';
      erpBanner.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    }
    if (erpTitle) erpTitle.textContent = 'Pour Requisition: Authorized';
    if (erpExposure) erpExposure.textContent = '₹0 Exposure';
    if (erpDesc) erpDesc.textContent = 'Requisition #RQ-T1-884 for slab foundation concrete pour active.';

    if (timelineEl) {
      timelineEl.innerHTML = `
        <div class="timeline-event-item">
          <span class="timeline-time">01:05:22 PM</span>
          <span>Crane payload transfer to grid line B4 completed.</span>
        </div>
      `;
    }
  } else if (camId === 'cam04') {
    if (titleEl) titleEl.textContent = 'Live Report: CAM 04';
    if (subEl) subEl.textContent = 'Heavy Vehicle Bay • Inward Materials Gate';
    if (statusTextEl) statusTextEl.textContent = 'TELEMETRY NORMAL';
    if (zoneValEl) {
      zoneValEl.textContent = 'Compliant';
      zoneValEl.className = 'chip-val';
      zoneValEl.style.color = '#10b981';
    }

    if (detListEl) {
      detListEl.innerHTML = `
        <div class="detection-item-row">
          <div class="item-name-tag">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; display: inline-block;"></span>
            <span>Commercial Flatbed Truck MH-12-RN-8812</span>
          </div>
          <span class="item-conf-badge">97.2%</span>
        </div>
        <div class="detection-item-row">
          <div class="item-name-tag">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
            <span>200 Bags Bulk Inward Receiving</span>
          </div>
          <span class="item-conf-badge">95.1%</span>
        </div>
      `;
    }

    if (erpBanner) {
      erpBanner.style.background = '#15241b';
      erpBanner.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    }
    if (erpTitle) erpTitle.textContent = 'Delivery Challan: Matched';
    if (erpExposure) erpExposure.textContent = '₹0 Exposure';
    if (erpDesc) erpDesc.textContent = 'Inward Delivery Challan #DC-2026-990 matched with Purchase Order #PO-8812.';

    if (timelineEl) {
      timelineEl.innerHTML = `
        <div class="timeline-event-item">
          <span class="timeline-time">01:45:00 PM</span>
          <span>Truck MH-12-RN-8812 entered Loading Bay with 200 bags PPC.</span>
        </div>
      `;
    }
  }
}

// Security Gate Alert Trigger
function triggerSecurityAlert() {
  showToast('🚨 Alert dispatched to Site Security Gate 02: Audio alarm and strobe activated!', true);
}

// Filter Analytics Time Range
function setAnalyticsRange(range, event) {
  if (event) {
    document.querySelectorAll('.filter-pill-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
  }
  showToast(`Updated Material Analytics view to: ${range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}`);
}

// Draw snapshot overlay inside the modal over real video
function renderEvidenceSnapshot() {
  const canvas = document.getElementById('evidenceSnapshotCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  // Clear canvas so the video is visible underneath
  ctx.clearRect(0, 0, w, h);

  // Red Anomaly Bounding Box on construction zone
  const boxX = w * 0.38;
  const boxY = h * 0.35;
  const boxW = 210;
  const boxH = 140;

  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(boxX, boxY, boxW, boxH);
  drawYoloCorners(ctx, boxX, boxY, boxW, boxH, '#f43f5e');

  // Label tag
  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(boxX, boxY - 24, 240, 24);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('ANOMALY: 3x cement_bag [94.6%] #BT-491', boxX + 6, boxY - 8);

  // Secondary Person Bounding Box
  const workerX = boxX - 90;
  const workerY = boxY + 10;
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.strokeRect(workerX, workerY, 70, 130);
  drawYoloCorners(ctx, workerX, workerY, 70, 130, '#3b82f6');
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(workerX, workerY - 20, 130, 20);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('person: 0.96 [ID: 12]', workerX + 5, workerY - 6);

  // ByteTrack dashed trajectory trail
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(120, h - 80);
  ctx.bezierCurveTo(240, h - 90, 320, boxY + boxH / 2, boxX + boxW / 2, boxY + boxH / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Trajectory Waypoint Markers
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(120, h - 80, 5, 0, Math.PI * 2);
  ctx.arc(280, h - 95, 5, 0, Math.PI * 2);
  ctx.arc(boxX + boxW / 2, boxY + boxH / 2, 6, 0, Math.PI * 2);
  ctx.fill();

  // Scanline overlay
  drawScanlines(ctx, w, h);
}

function drawScanlines(ctx, w, h) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1);
  }
}
