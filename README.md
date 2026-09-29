# BuildGuard AI (Billguard AI) 🛡️🏗️

> **Real-time Construction Material Accountability & Visual Edge Intelligence Platform**

BuildGuard AI bridges the gap between physical CCTV footage and digital ERP inventory tracking at construction sites, automatically catching unaccounted material movement, unauthorized gate egress, and unexpected wastage before losses escalate.

---

## 🚀 Key Features

- **Live CCTV & AI Vision Stream**: Cinema-grade camera monitoring powered by simulated YOLOv8 object detection and ByteTrack multi-object tracking.
- **Real-Time Construction Site Video Feed**: Live integration of actual foundation and site exit footage (`CAM 02 — Main Site Exit Gate`).
- **ERP Gate Pass Cross-Checking**: Instant reconciliation between physical material movements and active digital gate passes / ERP requisition logs.
- **Quantified Exposure Estimation**: Automated real-time financial exposure calculation for unverified physical transfers.
- **Incident Investigation & Evidence Vault**: Forensic modal inspects timestamped CCTV clips, trajectory paths, ByteTrack IDs, and supervisor action flows.
- **High-Density 2.5D Dashboard**: Clean glassmorphism aesthetics, embedded card elevations, crisp 8px border radiuses, and integrated Material Variance & Consumption Analytics.
- **Dark Burgundy Alert System**: High-contrast, sleek error banners and status pills matching modern enterprise security standards.

---

## 🛠️ Tech Stack

- **Frontend**: Pure Semantic HTML5, Vanilla Modern CSS3 (Glassmorphism, CSS Grid & Flexbox), and Vanilla JavaScript (ES6+).
- **Computer Vision & HUD**: HTML5 Canvas rendering real-time bounding boxes, trajectory lines, and scanline reticles.
- **Media**: HTML5 Video Player with seamless camera switcher and telemetry HUD overlays.

---

## 📦 Getting Started

### Local Setup
Run a simple HTTP server from the project directory:

```bash
cd frontend
python3 -m http.server 3456
```

Open your browser and navigate to:
- **Dashboard**: `http://localhost:3456`
- **Live Camera Stream**: `http://localhost:3456/#live`
- **Alerts Queue**: `http://localhost:3456/#alerts`

---

## 📄 License
MIT License. Built for advanced construction accountability.
