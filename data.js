// data.js – gegenereerd uit Google Sheet/Excel
// Codering: 1 = eens, 0 = geen mening, -1 = oneens

export const THEMES = [
  { id: 'bouwen', label: 'bouwen' },
  { id: 'leefbaarheid', label: 'leefbaarheid' },
  { id: 'voorzieningen', label: 'voorzieningen' },
  { id: 'participatie', label: 'participatie' }
];

export const STATEMENTS = [
  { id: 's1', themeId: 'voorzieningen', text: `Eerst de noodzakelijke voorzieningen (zorg, energie, bereikbaarheid etc.) op orde, dan pas grootschalig verder bouwen in Nissewaard.`, uitleg: `In Nissewaard is discussie over de vraag of de huidige infrastructuur en voorzieningen de groei aankunnen. Inwoners wijzen op drukte op wegen, brugopeningen en tekorten aan huisartsen en andere basisvoorzieningen. Voorstanders vinden dat de gemeente eerst deze knelpunten moet oplossen voordat er nieuwe wijken bijkomen. Tegenstanders vinden dat woningbouw nodig is om investeringen in wegen en voorzieningen juist mogelijk te maken.` },
  { id: 's2', themeId: 'bouwen', text: `Nissewaard moet meer woningen bouwen dan alleen voor de eigen inwoners, en actief bijdragen aan het regionale en landelijke woningtekort.`, uitleg: `De woningnood is groot in de regio Rotterdam. De vraag is of Nissewaard vooral moet bouwen voor de eigen inwoners of ook voor mensen die uit andere gemeenten komen. Voorstanders vinden dat de gemeente verantwoordelijkheid moet nemen in de regio. Tegenstanders vinden dat eerst voldoende betaalbare woningen voor huidige inwoners nodig zijn.` },
  { id: 's3', themeId: 'bouwen', text: `Nissewaard ontwikkelt een divers aanbod aan woonconcepten voor senioren om doorstromen voor hen aantrekkelijk te maken.`, uitleg: `Nissewaard heeft een ander karakter dan Rotterdam: rustiger, groener en minder stedelijk. De vraag is of meer stedelijke bouw en dichtheid, zoals in Rotterdam, hierbij passen. Voorstanders willen het dorpse en groene karakter behouden. Tegenstanders vinden dat een stedelijker ontwikkeling nodig is voor voorzieningen, woningen en economische groei.` },
  { id: 's4', themeId: 'leefbaarheid', text: `Nissewaard profiteert van het beste van twee werelden: de nabijheid van wereldstad Rotterdam en het unieke eilandkarakter van Voorne-Putten. Die balans moeten we koesteren.`, uitleg: `Er is relatief weinig aanbod van seniorenwoningen en wooncomplexen met voorzieningen zoals een tuin of ontmoetingsruimte. Voorstanders vinden dat meer passende woningen nodig zijn zodat ouderen kunnen verhuizen en gezinswoningen vrijkomen. Tegenstanders vinden dat de markt dit moet oppakken of dat andere woninggroepen prioriteit hebben.` },
  { id: 's5', themeId: 'participatie', text: `De stem van inwoners wordt in Nissewaard voldoende meegewogen bij belangrijke besluiten, zoals bij grote bouwprojecten.`, uitleg: `De gemeente betrekt inwoners via participatie en informatiebijeenkomsten. De vraag is of dit voldoende is. Voorstanders van de stelling vinden dat inwoners al genoeg mogelijkheden hebben om mee te praten en dat de gemeenteraad uiteindelijk een afweging moet maken. Tegenstanders vinden dat inwoners eerder, beter en transparanter betrokken moeten worden en dat dit nu onvoldoende gebeurt.` },
];

export const PARTIES = [
  {
    id: 'belang_van_nissewaard',
    name: 'Belang van Nissewaard',
    answers: {
      s1: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s2: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s3: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s4: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s5: { pos: 0, note: `Hier komt mijn toelichting als partij` },
    },
  },
  {
    id: 'cda',
    name: 'CDA',
    answers: {
      s1: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s2: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s3: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s4: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s5: { pos: 0, note: `Hier komt mijn toelichting als partij` },
    },
  },
  {
    id: 'christenuniesgp',
    name: 'ChristenUnieSGP',
    answers: {
      s1: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s2: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s3: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s4: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s5: { pos: 0, note: `Hier komt mijn toelichting als partij` },
    },
  },
  {
    id: 'forum_voor_democratie',
    name: 'Forum voor Democratie',
    answers: {
      s1: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s2: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s3: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s4: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s5: { pos: 0, note: `Hier komt mijn toelichting als partij` },
    },
  },
  {
    id: 'groenlinks',
    name: 'GroenLinks',
    answers: {
      s1: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s2: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s3: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s4: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s5: { pos: 0, note: `Hier komt mijn toelichting als partij` },
    },
  },
  {
    id: 'hardt',
    name: 'Hardt',
    answers: {
      s1: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s2: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s3: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s4: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s5: { pos: 0, note: `Hier komt mijn toelichting als partij` },
    },
  },
  {
    id: 'jong_nissewaard',
    name: 'Jong Nissewaard',
    answers: {
      s1: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s2: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s3: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s4: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s5: { pos: 0, note: `Hier komt mijn toelichting als partij` },
    },
  },
  {
    id: 'nissewaard_lokaal',
    name: 'Nissewaard Lokaal',
    answers: {
      s1: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s2: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s3: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s4: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s5: { pos: 0, note: `Hier komt mijn toelichting als partij` },
    },
  },
  {
    id: 'ons',
    name: 'ONS',
    answers: {
      s1: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s2: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s3: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s4: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s5: { pos: 0, note: `Hier komt mijn toelichting als partij` },
    },
  },
  {
    id: 'pvv',
    name: 'PVV',
    answers: {
      s1: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s2: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s3: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s4: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s5: { pos: 0, note: `Hier komt mijn toelichting als partij` },
    },
  },
  {
    id: 'pvda',
    name: 'PvdA',
    answers: {
      s1: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s2: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s3: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s4: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s5: { pos: 0, note: `Hier komt mijn toelichting als partij` },
    },
  },
  {
    id: 'sp',
    name: 'SP',
    answers: {
      s1: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s2: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s3: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s4: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s5: { pos: 0, note: `Hier komt mijn toelichting als partij` },
    },
  },
  {
    id: 'voor_nissewaard',
    name: 'VOOR Nissewaard',
    answers: {
      s1: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s2: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s3: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s4: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s5: { pos: 0, note: `Hier komt mijn toelichting als partij` },
    },
  },
  {
    id: 'vvd',
    name: 'VVD',
    answers: {
      s1: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s2: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s3: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s4: { pos: 0, note: `Hier komt mijn toelichting als partij` },
      s5: { pos: 0, note: `Hier komt mijn toelichting als partij` },
    },
  },
];

// Standpunten per partij (tabblad: standpunten)
// Velden: wonen_bouwen / verkeer_parkeren / molenzicht
export const PARTY_STANDPOINTS = {
  'belang_van_nissewaard': { wonen_leefbaarheid: '', verkeersontsluiting: '', uw_molenzicht: '' },
  'cda':   { wonen_leefbaarheid: '', verkeersontsluiting: '', uw_molenzicht: '' },
  'christenuniesgp':   { wonen_leefbaarheid: '', verkeersontsluiting: '', uw_molenzicht: '' },
  'forum_voor_democratie':  { wonen_leefbaarheid: '', verkeersontsluiting: '', uw_molenzicht: '' },
  'groenlinks':   { wonen_leefbaarheid: '', verkeersontsluiting: '', uw_molenzicht: '' },
  'hardt':   { wonen_leefbaarheid: '', verkeersontsluiting: '', uw_molenzicht: '' },
  'jong_nissewaard':   { wonen_leefbaarheid: '', verkeersontsluiting: '', uw_molenzicht: '' },
  'nissewaard_lokaal':  { wonen_leefbaarheid: '', verkeersontsluiting: '', uw_molenzicht: '' },
  'ons':   { wonen_leefbaarheid: '', verkeersontsluiting: '', uw_molenzicht: '' },
  'pvv':  { wonen_leefbaarheid: '', verkeersontsluiting: '', uw_molenzicht: '' },
  'pvda':   { wonen_leefbaarheid: '', verkeersontsluiting: '', uw_molenzicht: '' },
  'sp':   { wonen_leefbaarheid: '', verkeersontsluiting: '', uw_molenzicht: '' },
  'voor_nissewaard':   { wonen_leefbaarheid: '', verkeersontsluiting: '', uw_molenzicht: '' },
  'vvd':   { wonen_leefbaarheid: '', verkeersontsluiting: '', uw_molenzicht: '' },
};

