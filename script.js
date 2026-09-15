/* ============================================================
   MAP SETUP — Light green background, more transparent
   ============================================================ */
const map = L.map('map', {
  zoomControl: true,
  worldCopyJump: false,
  minZoom: 2,
  maxBounds: [[-85, -180], [85, 180]],
  maxBoundsViscosity: 1.0
}).setView([25, 40], 2);

/* ============================================================
   TRANSPARENT LIGHT GREEN BACKGROUND LAYER
   ============================================================ */
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '',
  maxZoom: 19,
  noWrap: true,
  className: 'light-map-tiles',
  opacity: 0.25
}).addTo(map);

/* Store GeoJSON layer for hover effects */
let geoJSONLayer;

/* ============================================================
   FETCH WORLD BORDERS GEOJSON & ADD DARK BLUE BORDERS
   ============================================================ */
fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
  .then(response => response.json())
  .then(data => {
    geoJSONLayer = L.geoJSON(data, {
      style: function(feature) {
        return {
          color: '#0d2438',           /* Very dark blue border */
          weight: 3,
          opacity: 1.0,
          fillColor: '#8ec68e',       /* Medium green fill */
          fillOpacity: 0.35
        };
      },
      onEachFeature: function(feature, layer) {
        layer.unbindPopup();
        const countryName = feature.properties.ADMIN || 'Unknown';
        
        /* Add hover effect */
        layer.on('mouseover', function() {
          this.setStyle({
            color: '#DA70D6',         /* Neon purple on hover */
            weight: 5,
            opacity: 1.0,
            fillColor: '#a8e6a8',
            fillOpacity: 0.5
          });
          this.bringToFront();
          
          /* Show country name tooltip */
          this.bindTooltip(countryName, {
            permanent: false,
            direction: 'center',
            className: 'country-label',
            offset: [0, 0]
          }).openTooltip();
        });
        
        layer.on('mouseout', function() {
          this.setStyle({
            color: '#0d2438',
            weight: 3,
            opacity: 1.0,
            fillColor: '#8ec68e',
            fillOpacity: 0.35
          });
          this.closeTooltip();
        });
      }
    }).addTo(map);
  })
  .catch(err => console.log('Error loading borders:', err));

/* ============================================================
   SIDEBAR FUNCTIONS
   ============================================================ */
function openFactorySidebar(factory) {
  const sidebar = document.getElementById('sidebar');
  const sidebarContent = document.getElementById('sidebar-content');
  const sidebarTitle = document.getElementById('sidebar-title');
  const mapDiv = document.getElementById('map');
  
  sidebarTitle.textContent = 'Factory Details';
  
  sidebarContent.innerHTML = `
    <div class="info-section">
      <div class="info-label">Factory Number</div>
      <div class="info-value">
        <span class="factory-number">F${factory.number}</span>
        ${factory.name}
      </div>
    </div>

    <div class="info-section">
      <div class="info-label">Location</div>
      <div class="info-value">${factory.city}</div>
      <div class="info-label">Country</div>
      <div class="info-value">${factory.country}</div>
    </div>

    <div class="info-section">
      <div class="info-label">Coordinates</div>
      <div class="info-value">${factory.lat.toFixed(4)}, ${factory.lng.toFixed(4)}</div>
    </div>

    <div class="info-section">
      <div class="info-label">Director</div>
      <div class="info-value">${factory.director}</div>
    </div>

    <div class="info-section">
      <div class="info-label">Staff Count</div>
      <div class="info-value">${factory.staff} employees</div>
    </div>

    <div class="info-section">
      <div class="info-label">Main Products</div>
      <div class="info-value">${factory.products.join(', ')}</div>
    </div>
  `;
  
  sidebar.classList.add('open');
  mapDiv.classList.add('sidebar-open');
}

function openLocationSidebar(location) {
  const sidebar = document.getElementById('sidebar');
  const sidebarContent = document.getElementById('sidebar-content');
  const sidebarTitle = document.getElementById('sidebar-title');
  const mapDiv = document.getElementById('map');
  
  sidebarTitle.textContent = 'Location Details';
  
  sidebarContent.innerHTML = `
    <div class="info-section">
      <div class="info-label">Location Name</div>
      <div class="info-value">
        <span class="factory-number">${location.code}</span>
        ${location.name}
      </div>
    </div>

    <div class="info-section">
      <div class="info-label">Country/Region</div>
      <div class="info-value">${location.country}</div>
    </div>

    <div class="info-section">
      <div class="info-label">Coordinates</div>
      <div class="info-value">${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</div>
    </div>

    <div class="info-section">
      <div class="info-label">Category</div>
      <div class="info-value">${location.category}</div>
    </div>
  `;
  
  sidebar.classList.add('open');
  mapDiv.classList.add('sidebar-open');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mapDiv = document.getElementById('map');
  sidebar.classList.remove('open');
  mapDiv.classList.remove('sidebar-open');
}

document.getElementById('sidebar-close').addEventListener('click', closeSidebar);

/* ============================================================
   FACTORY MARKER — Brown dots
   ============================================================ */
const factoryIcon = () => L.divIcon({
  className: '',
  html: `<div style="
    width:14px;height:14px;border-radius:50%;
    background:#8B5A3C;
    border:3px solid #ffb347;
    box-shadow:0 0 6px rgba(139,90,60,0.8), 0 0 12px rgba(0,0,0,0.6);
    cursor: pointer;
  "></div>`,
  iconSize: [14,14],
  iconAnchor: [7,7]
});

/* ============================================================
   LOCATION MARKER — Blue dots
   ============================================================ */
const locationIcon = () => L.divIcon({
  className: '',
  html: `<div style="
    width:14px;height:14px;border-radius:50%;
    background:#0066cc;
    border:3px solid #0099ff;
    box-shadow:0 0 6px rgba(0,102,204,0.8), 0 0 12px rgba(0,0,0,0.6);
    cursor: pointer;
  "></div>`,
  iconSize: [14,14],
  iconAnchor: [7,7]
});

/* ============================================================
   ADD FACTORIES TO MAP WITH HOVER TOOLTIPS
   ============================================================ */
factories.forEach(f => {
  const m = L.marker([f.lat, f.lng], { icon: factoryIcon(), zIndexOffset: 1000 }).addTo(map);

  /* Permanent city name label */
  m.bindTooltip(f.city, {
    permanent: true,
    direction: 'right',
    offset: [8, 0],
    className: 'factory-label'
  });

  /* Hover tooltip with factory info */
  const hoverContent = `<strong>${f.name}</strong><br/>Director: ${f.director}<br/>Staff: ${f.staff}<br/>Products: ${f.products.join(', ')}`;
  
  m.on('mouseover', function() {
    this.bindTooltip(hoverContent, {
      permanent: false,
      direction: 'top',
      offset: [0, -15],
      className: 'hover-tooltip',
      opacity: 1
    }).openTooltip();
  });

  m.on('mouseout', function() {
    this.closeTooltip();
  });

  /* Click to open sidebar */
  m.on('click', () => {
    openFactorySidebar(f);
    m.openPopup();
  });

  m.bindPopup(`
    <div class="label">Factory ${f.number}</div>
    <h4>${f.city}, ${f.country}</h4>
    <p><strong>Director:</strong> ${f.director}</p>
    <p><strong>Staff:</strong> ${f.staff} employees</p>
    <p><strong>Products:</strong> ${f.products.join(', ')}</p>
  `, {
    maxWidth: 300,
    className: 'factory-popup'
  });
});

/* ============================================================
   ADD LOCATIONS TO MAP WITH HOVER TOOLTIPS
   ============================================================ */
locations.forEach(loc => {
  const m = L.marker([loc.lat, loc.lng], { icon: locationIcon(), zIndexOffset: 1000 }).addTo(map);

  /* Permanent location name label */
  m.bindTooltip(loc.name, {
    permanent: true,
    direction: 'right',
    offset: [8, 0],
    className: 'location-label'
  });

  /* Hover tooltip with code + category */
  const hoverContent = `<strong>${loc.code}</strong><br/>${loc.category}`;
  
  m.on('mouseover', function() {
    this.bindTooltip(hoverContent, {
      permanent: false,
      direction: 'top',
      offset: [0, -15],
      className: 'hover-tooltip',
      opacity: 1
    }).openTooltip();
  });

  m.on('mouseout', function() {
    this.closeTooltip();
  });

  /* Click to open sidebar */
  m.on('click', () => {
    openLocationSidebar(loc);
  });

  m.bindPopup(`
    <h4>${loc.name}</h4>
    <p><strong>Code:</strong> ${loc.code}</p>
    <p><strong>Category:</strong> ${loc.category}</p>
    <p><strong>Country/Region:</strong> ${loc.country}</p>
  `, {
    maxWidth: 300
  });
});

/* ============================================================
   HANDLE WINDOW RESIZE FOR MAP
   ============================================================ */
window.addEventListener('resize', () => {
  setTimeout(() => {
    map.invalidateSize();
  }, 250);
});
