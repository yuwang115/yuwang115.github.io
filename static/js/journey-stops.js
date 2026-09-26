// Stops shown on the Experience page journey map.
// Coordinates are [longitude, latitude] (MapLibre order, not Leaflet's).
// `zoom` is the fly-to zoom used when a stop is selected; `label` optionally overrides
// the chip text (defaults to the city part of `place`).

export const CATEGORIES = {
  base: { label: 'Study & work', color: '#f43f5e' },
  event: { label: 'Conferences & schools', color: '#f59e0b' },
  field: { label: 'Research region', color: '#22d3ee' },
};

export const STOPS = [
  {
    id: 'chicago',
    place: 'Chicago, USA',
    institution: 'The University of Chicago (CSEi)',
    coords: [-87.5987, 41.7886], // Hyde Park main campus
    zoom: 15,
    years: '2026–present',
    category: 'base',
    summary:
      'Postdoctoral scholar in the Climate Systems Engineering initiative, Institute for Climate and Sustainable Growth.',
  },
  {
    id: 'hobart',
    place: 'Hobart, Australia',
    institution: 'IMAS / AAPP, University of Tasmania',
    coords: [147.3358, -42.886], // IMAS Waterfront building
    zoom: 15,
    years: '2019–2026',
    category: 'base',
    summary: 'PhD and Honours work on East Antarctic ice dynamics at the University of Tasmania.',
  },
  {
    id: 'beijing',
    place: 'Beijing, China',
    institution: 'Beijing Normal University',
    coords: [116.3663, 39.9625], // main campus
    zoom: 15,
    years: '2021–2022',
    category: 'base',
    summary: 'Visiting student in John Moore’s group, extending ice-sheet modeling skills.',
  },
  {
    id: 'qingdao',
    place: 'Qingdao, China',
    institution: 'Ocean University of China',
    coords: [120.335, 36.0645], // Yushan campus
    zoom: 15,
    years: '2017–2021',
    category: 'base',
    summary: 'BSc in Marine Science; foundations in oceanography.',
  },
  {
    id: 'wilkes',
    place: 'Wilkes Subglacial Basin',
    institution: 'East Antarctica',
    coords: [145, -73], // approximate basin center
    zoom: 3.4,
    years: 'PhD focus',
    category: 'field',
    summary:
      'Core research domain for my PhD on the future evolution of the ice sheet and ice–hydrology interactions.',
  },
  {
    id: 'amery',
    place: 'Amery Ice Shelf',
    institution: 'East Antarctica',
    coords: [70.4, -70.9], // approximate ice-shelf center
    zoom: 4.6,
    years: 'Honours focus',
    category: 'field',
    summary:
      'Honours research on the thermal structure of the Amery Ice Shelf, combining borehole observations with ice-flow simulations.',
  },
  {
    id: 'afops',
    place: 'Shanghai, China',
    label: 'Shanghai (AFoPS)',
    institution: 'AFoPS Summer School, Polar Research Institute of China',
    coords: [121.685, 31.3133], // PRIC campus on the Yangtze, Pudong (since 2022)
    zoom: 15,
    years: 'Jul 2026',
    category: 'event',
    summary: 'Asian Forum for Polar Sciences summer school for early-career polar scientists.',
  },
  {
    id: 'zhuhai',
    place: 'Zhuhai, China',
    institution: 'Asia Early Career Polar Forum 2026, Sun Yat-sen University',
    coords: [113.5865, 22.351], // SYSU Zhuhai campus, Tangjiawan
    zoom: 15,
    years: 'Jun 2026',
    category: 'event',
    summary: 'Delivered an oral presentation at the Asia Early Career Polar Forum.',
  },
  {
    id: 'wellington',
    place: 'Wellington, New Zealand',
    institution: 'CliC Open Science Conference 2026',
    coords: [174.7812, -41.2914], // Tākina Wellington Convention Centre
    zoom: 15,
    years: 'Feb 2026',
    category: 'event',
    summary: 'Attended CliC2026 and delivered an oral presentation.',
  },
  {
    id: 'kioloa',
    place: 'Kioloa, Australia',
    institution: 'Antarctic Tipping Points Winter School',
    coords: [150.3775, -35.5537],
    zoom: 13,
    years: 'Jun 2025',
    category: 'event',
    summary: 'Lecturer for the Kioloa Winter School, sharing ice-sheet research workflows.',
  },
  {
    id: 'shanghai',
    place: 'Shanghai, China',
    label: 'Shanghai (SJTU)',
    institution: 'Shanghai Jiao Tong University',
    coords: [121.4305, 31.2005], // Xuhui campus
    zoom: 15,
    years: 'Dec 2024',
    category: 'event',
    summary: 'Invited seminar at the School of Oceanography.',
  },
  {
    id: 'karthaus',
    place: 'Karthaus, Italy',
    institution: 'Summer School on Glaciology',
    coords: [10.967, 46.783],
    zoom: 13,
    years: 'May–Jun 2024',
    category: 'event',
    summary: 'Intensive glaciology training focusing on ice dynamics and modeling.',
  },
  {
    id: 'rovaniemi',
    place: 'Rovaniemi, Finland',
    institution: 'ICEMAP Workshop',
    coords: [25.7294, 66.5039], // city center
    zoom: 12,
    years: 'May 2024',
    category: 'event',
    summary: 'ICEMAP workshop on Antarctic numerical modeling led by Rupert Gladstone.',
  },
  {
    id: 'vienna',
    place: 'Vienna, Austria',
    institution: 'EGU General Assembly 2024',
    coords: [16.4157, 48.2346], // Austria Center Vienna
    zoom: 15,
    years: 'Apr 2024',
    category: 'event',
    summary: 'Presentation in Session CR1.3 at the European Geosciences Union General Assembly.',
  },
];
