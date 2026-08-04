export const stationSeedData = [
  {
    name: 'Charge Claim Kadıköy',
    district: 'Kadıköy',
    address: 'Caferağa Mahallesi, Kadıköy/İstanbul',
    latitude: 40.9909,
    longitude: 29.0286,
  },
  {
    name: 'Charge Claim Beşiktaş',
    district: 'Beşiktaş',
    address: 'Sinanpaşa Mahallesi, Beşiktaş/İstanbul',
    latitude: 41.043,
    longitude: 29.0094,
  },
  {
    name: 'Charge Claim Şişli',
    district: 'Şişli',
    address: 'Merkez Mahallesi, Şişli/İstanbul',
    latitude: 41.0605,
    longitude: 28.9872,
  },
  {
    name: 'Charge Claim Üsküdar',
    district: 'Üsküdar',
    address: 'Mimar Sinan Mahallesi, Üsküdar/İstanbul',
    latitude: 41.0258,
    longitude: 29.0153,
  },
  {
    name: 'Charge Claim Ataşehir',
    district: 'Ataşehir',
    address: 'Atatürk Mahallesi, Ataşehir/İstanbul',
    latitude: 40.9833,
    longitude: 29.1278,
  },
  {
    name: 'Charge Claim Maltepe',
    district: 'Maltepe',
    address: 'Altayçeşme Mahallesi, Maltepe/İstanbul',
    latitude: 40.9357,
    longitude: 29.1551,
  },
  {
    name: 'Charge Claim Kartal',
    district: 'Kartal',
    address: 'Kordonboyu Mahallesi, Kartal/İstanbul',
    latitude: 40.8906,
    longitude: 29.1855,
  },
  {
    name: 'Charge Claim Bakırköy',
    district: 'Bakırköy',
    address: 'Zeytinlik Mahallesi, Bakırköy/İstanbul',
    latitude: 40.9819,
    longitude: 28.8772,
  },
  {
    name: 'Charge Claim Sarıyer',
    district: 'Sarıyer',
    address: 'Merkez Mahallesi, Sarıyer/İstanbul',
    latitude: 41.1663,
    longitude: 29.0574,
  },
  {
    name: 'Charge Claim Beylikdüzü',
    district: 'Beylikdüzü',
    address: 'Cumhuriyet Mahallesi, Beylikdüzü/İstanbul',
    latitude: 41.0011,
    longitude: 28.6419,
  },
];

export const connectorTemplates = [
  {
    code: 'AC-01',
    type: 'TYPE_2',
    powerKw: '22.00',
    pricePerKWh: '8.50',
  },
  {
    code: 'DC-01',
    type: 'CCS2',
    powerKw: '60.00',
    pricePerKWh: '11.50',
  },
  {
    code: 'AC-02',
    type: 'TYPE_2',
    powerKw: '22.00',
    pricePerKWh: '8.50',
  },
] as const;

export const connectorStationPlan = [
  { stationName: 'Charge Claim Kadıköy', connectorCount: 3 },
  { stationName: 'Charge Claim Beşiktaş', connectorCount: 3 },
  { stationName: 'Charge Claim Şişli', connectorCount: 3 },
  { stationName: 'Charge Claim Üsküdar', connectorCount: 3 },
  { stationName: 'Charge Claim Ataşehir', connectorCount: 3 },
  { stationName: 'Charge Claim Maltepe', connectorCount: 2 },
  { stationName: 'Charge Claim Kartal', connectorCount: 2 },
  { stationName: 'Charge Claim Bakırköy', connectorCount: 2 },
  { stationName: 'Charge Claim Sarıyer', connectorCount: 2 },
  { stationName: 'Charge Claim Beylikdüzü', connectorCount: 2 },
] as const;
