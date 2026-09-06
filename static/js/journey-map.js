(() => {
  const containerId = 'experience-map';

const stops = [
  {
    title: 'Chicago, USA — The University of Chicago (CSEi)',
    coords: [41.7886, -87.5987], // 定位到芝加哥大学 Hyde Park 主校区
    years: '2026–present',
    summary:
      'Postdoctoral scholar in the Climate Systems Engineering initiative, Institute for Climate and Sustainable Growth.',
  },
  {
    title: 'Hobart, Australia — IMAS/AAPP',
    coords: [-42.886, 147.3358], // 保持不变 (IMAS Waterfront)
    years: '2019–2026',
    summary: 'PhD and Honours work on East Antarctic ice dynamics at University of Tasmania.',
  },
  {
    title: 'Qingdao, China — Ocean University of China',
    coords: [36.0645, 120.3350], // 更新：定位到鱼山校区附近
    years: '2017–2021',
    summary: 'BSc in Marine Science; foundations in oceanography.',
  },
  {
    title: 'Beijing, China — Beijing Normal University',
    coords: [39.9625, 116.3663], // 更新：定位到北师大主校区
    years: '2021–2022',
    summary: 'Visiting student in John Moore’s group, extending ice-sheet modelling skills.',
  },
  {
    title: 'Vienna, Austria — EGU General Assembly 2024',
    coords: [48.2346, 16.4157], // 更新：定位到 Austria Center Vienna (会场)
    years: 'Apr 2024',
    summary: 'Presentation in Session CR1.3 at the European Geosciences Union GA.',
  },
  {
    title: 'Rovaniemi, Finland — ICEMAP Workshop',
    coords: [66.5039, 25.7294], // 定位到罗瓦涅米市区
    years: 'May 2024',
    summary: 'ICEMAP workshop on Antarctic numerical modelling led by Rupert Gladstone.',
  },
  {
    title: 'Karthaus, Italy — Summer School on Glaciology',
    coords: [46.783, 10.967], // 保持不变
    years: 'May–Jun 2024',
    summary: 'Intensive glaciology training focusing on ice dynamics and modelling.',
  },
  {
    title: 'Kioloa, Australia — Antarctic Tipping Points School',
    coords: [-35.5537, 150.3775], // 保持不变
    years: 'Jun 2025',
    summary: 'Lecturer for the Kioloa Winter School, sharing ice-sheet research workflows.',
  },
  {
    title: 'Wellington, New Zealand — CliC Open Science Conference 2026',
    coords: [-41.2914, 174.7812], // 定位到 Tākina Wellington Convention Centre
    years: 'Feb 2026',
    summary: 'Attended CliC2026 and delivered an oral presentation.',
  },
  {
    title: 'Shanghai, China — Invited Seminar',
    coords: [31.2005, 121.4305], // 更新：定位到上海交大徐汇校区
    years: 'Dec 2024',
    summary: 'Seminar at Shanghai Jiao Tong University’s School of Oceanography.',
  },
  {
    title: 'Wilkes Subglacial Basin, East Antarctica',
    coords: [-73, 145], // 保持不变 (区域中心)
    years: 'PhD focus',
    summary: 'Core research domain for my PhD on future evolution of the ice sheet and ice–hydrology interactions.',
  },
];

  const renderPopup = ({ title, years, summary }) =>
    `<strong>${title}</strong><br><em>${years}</em><br>${summary}`;

  function initMap() {
    const container = document.getElementById(containerId);
    if (!container || typeof window.L === 'undefined') return;

    const map = L.map(container, {
      scrollWheelZoom: false,
      worldCopyJump: true,
    }).setView([10, 20], 2);

    // Esri World Topo: keyless basemap. CARTO's basemaps now stamp
    // "API KEY REQUIRED" over tiles requested without a key.
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
      maxZoom: 18,
    }).addTo(map);

    stops.forEach((stop, index) => {
      const marker = L.marker(stop.coords, { title: stop.title }).addTo(map);
      marker.bindPopup(renderPopup(stop));
      if (index === 0) marker.openPopup();
    });

    map.on('popupopen', (e) => map.panTo(e.popup.getLatLng()));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }
})();
