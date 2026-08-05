// Data sources
// 1. Primary: the Google Spreadsheet (public CSV export, CORS enabled)
// 2. Secondary: Google Apps Script web app
// 3. Last resort: embedded fallback data
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw6SnXISZM0KaowpSYTCeaQzhBYwj5jejcQZl4qqvIRq8zhXtfcFxzfpwws74EyO94vzw/exec';
const SPREADSHEET_ID = '140SeRjUIztuJG6F6SDRAkz3z5vlbA07kH0UZG17M1Wo';
const SHEET_GIDS = {
  basic: '0',          // BasicDetails
  farm: '1503017610',  // FarmIntervention
  nonFarm: '1675078846', // NonFarmIntervention
  sisd: '681513967',   // SISD Intervention
  fi: '1143138919'     // FIIntervention
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clean(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/^\uFEFF/, '').replace(/\s+$/g, '').trim();
}

function toInt(value) {
  if (value === null || value === undefined) return 0;
  const n = parseInt(String(value).replace(/[^0-9-]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

function cleanActual(value) {
  const v = clean(value);
  if (!v || /no data/i.test(v)) return '';
  return v;
}

function isJunkName(name) {
  const n = (name || '').toLowerCase();
  if (!n) return true;
  if (/\d+-block/i.test(n) || /\d+-clf/i.test(n)) return true;
  if (/(^|\s)total(\s|$)/i.test(n)) return true;
  if (/no data/i.test(n)) return true;
  if (/no clf/i.test(n)) return true;
  return false;
}

// Normalize a Google Drive link into a directly displayable image URL,
// or keep folder / external links as-is for the frontend to handle.
function normalizeImageUrl(url) {
  if (!url) return '';
  url = url.trim();
  if (!url) return '';

  var fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return 'https://drive.google.com/uc?export=view&id=' + fileMatch[1];

  var folderMatch = url.match(/drive\.google\.com\/(?:drive\/)?(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) return url; // keep folder link; frontend embeds the folder

  var idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return 'https://drive.google.com/uc?export=view&id=' + idMatch[1];

  if (/^https?:\/\//i.test(url)) return url;
  return '';
}

// Robust CSV parser (handles quoted fields, commas, quotes and newlines).
function parseCSV(text) {
  if (typeof text !== 'string') return [];
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function findColumn(headers, keywords) {
  for (let i = 0; i < headers.length; i++) {
    const cell = (headers[i] || '').toString().toLowerCase().trim();
    for (let k = 0; k < keywords.length; k++) {
      if (cell.indexOf(keywords[k]) !== -1) return i;
    }
  }
  return -1;
}

// Locate the actual header row, skipping any leading title row(s).
function findHeaderRow(rows, blockKeywords, clfKeywords) {
  for (let i = 0; i < rows.length; i++) {
    const headers = rows[i] || [];
    const colBlock = findColumn(headers, blockKeywords);
    const colCLF = findColumn(headers, clfKeywords);
    if (colBlock !== -1 && colCLF !== -1) return i;
  }
  return -1;
}

function buildValidPairs(blocks) {
  const set = new Set();
  (blocks || []).forEach(b => (b.clfs || []).forEach(c => {
    set.add((b.name || '').toLowerCase() + '::' + (c.name || '').toLowerCase());
  }));
  return set;
}

function iv(name, brief, image) {
  return { name: clean(name), brief: clean(brief), image: normalizeImageUrl(image) };
}

function sis(childCare, transitHome, followUp, vrf) {
  return { childCare: clean(childCare), transitHome: clean(transitHome), followUp: clean(followUp), vrf: clean(vrf) };
}

// ---------------------------------------------------------------------------
// Google Spreadsheet parsing
// ---------------------------------------------------------------------------

async function fetchSheetCsv(gid) {
  const url = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/export?format=csv&gid=' + gid;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function parseBasicDetails(rows) {
  if (!rows || rows.length < 2) return { blocks: [] };

  const headerIndex = findHeaderRow(rows, ['block'], ['clf name', 'clf']);
  if (headerIndex === -1) return { blocks: [] };

  const headers = rows[headerIndex];
  const colBlock = findColumn(headers, ['block']);
  const colCLF = findColumn(headers, ['clf name', 'clf']);
  const colVO = findColumn(headers, ['vo']);
  const colSHG = findColumn(headers, ['shg']);
  const colVillages = findColumn(headers, ['villages', 'village']);
  const colAddress = findColumn(headers, ['address', 'adress', 'addr']);
  const colLand = findColumn(headers, ['land']);
  const colActual = findColumn(headers, ['actual']);

  const blocksMap = {};
  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    const blockName = clean(row[colBlock]);
    const clfName = clean(row[colCLF]);

    if (!blockName || !clfName) continue;
    if (isJunkName(blockName) || isJunkName(clfName)) continue;

    const vo = toInt(colVO !== -1 ? row[colVO] : 0);
    const shg = toInt(colSHG !== -1 ? row[colSHG] : 0);
    const villages = toInt(colVillages !== -1 ? row[colVillages] : 0);
    const address = clean(colAddress !== -1 ? row[colAddress] : '');
    const landStatus = clean(colLand !== -1 ? row[colLand] : '');
    const shgActual = cleanActual(colActual !== -1 ? row[colActual] : '');

    if (!blocksMap[blockName]) blocksMap[blockName] = { name: blockName, clfs: [] };
    blocksMap[blockName].clfs.push({ name: clfName, vo: vo, shg: shg, villages: villages, address: address, landStatus: landStatus, shgActual: shgActual });
  }

  return { blocks: Object.values(blocksMap) };
}

function parseInterventionRows(rows, validPairs) {
  if (!rows || rows.length < 2) return [];

  const headerIndex = findHeaderRow(rows, ['block'], ['clf name', 'clf']);
  if (headerIndex === -1) return [];

  const headers = rows[headerIndex];
  const colBlock = findColumn(headers, ['block']);
  const colCLF = findColumn(headers, ['clf name', 'clf']);
  const colName = findColumn(headers, ['intervention', 'name of intervention']);
  const colBrief = findColumn(headers, ['brief']);
  const colImage = findColumn(headers, ['image', 'link']);

  const results = [];
  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    const block = clean(row[colBlock]);
    const clfName = clean(row[colCLF]);

    if (!clfName || isJunkName(clfName)) continue;
    if (colBlock !== -1 && !block) continue;
    if (validPairs && validPairs.has(block.toLowerCase() + '::' + clfName.toLowerCase())) {
      const name = clean(row[colName]);
      const brief = clean(row[colBrief]);
      const image = normalizeImageUrl(clean(row[colImage]));

      if (!name && !brief && !image) continue;

      results.push({ block: block, clfName: clfName, name: name, brief: brief, image: image });
    }
  }
  return results;
}

function parseSisdRows(rows, validPairs) {
  if (!rows || rows.length < 2) return [];

  const headerIndex = findHeaderRow(rows, ['block'], ['clf name', 'clf']);
  if (headerIndex === -1) return [];

  const headers = rows[headerIndex];
  const colBlock = findColumn(headers, ['block']);
  const colCLF = findColumn(headers, ['clf name', 'clf']);
  const colChild = findColumn(headers, ['child care']);
  const colTransit = findColumn(headers, ['transit home']);
  const colFollowUp = findColumn(headers, ['follow up', 'pregnant']);
  const colVRF = findColumn(headers, ['vrf', 'sam/mam']);

  const results = [];
  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    const block = clean(row[colBlock]);
    const clfName = clean(row[colCLF]);

    if (!block || !clfName || isJunkName(clfName)) continue;
    if (validPairs && !validPairs.has(block.toLowerCase() + '::' + clfName.toLowerCase())) continue;

    const childCare = colChild !== -1 ? clean(row[colChild]) : '';
    const transitHome = colTransit !== -1 ? clean(row[colTransit]) : '';
    const followUp = colFollowUp !== -1 ? clean(row[colFollowUp]) : '';
    const vrf = colVRF !== -1 ? clean(row[colVRF]) : '';

    if (!childCare && !transitHome && !followUp && !vrf) continue;

    results.push({ block: block, clfName: clfName, childCare: childCare, transitHome: transitHome, followUp: followUp, vrf: vrf });
  }
  return results;
}

function findSisdForCLF(sisdRows, blockName, clfName) {
  const empty = { childCare: '', transitHome: '', followUp: '', vrf: '' };
  if (!sisdRows || sisdRows.length === 0) return empty;

  const blockLower = (blockName || '').toLowerCase().trim();
  const clfLower = (clfName || '').toLowerCase().trim();

  for (let i = 0; i < sisdRows.length; i++) {
    const r = sisdRows[i] || {};
    if ((r.block || '').toLowerCase().trim() === blockLower && (r.clfName || '').toLowerCase().trim() === clfLower) {
      return {
        childCare: clean(r.childCare),
        transitHome: clean(r.transitHome),
        followUp: clean(r.followUp),
        vrf: clean(r.vrf)
      };
    }
  }
  return empty;
}

async function buildFromSpreadsheet() {
  const [basicCsv, farmCsv, nonFarmCsv, sisdCsv, fiCsv] = await Promise.all([
    fetchSheetCsv(SHEET_GIDS.basic),
    fetchSheetCsv(SHEET_GIDS.farm),
    fetchSheetCsv(SHEET_GIDS.nonFarm),
    fetchSheetCsv(SHEET_GIDS.sisd),
    fetchSheetCsv(SHEET_GIDS.fi)
  ]);

  const basic = parseBasicDetails(parseCSV(basicCsv));
  if (!basic.blocks || basic.blocks.length === 0) {
    throw new Error('No blocks found in spreadsheet');
  }

  const validPairs = buildValidPairs(basic.blocks);
  const farm = parseInterventionRows(parseCSV(farmCsv), validPairs);
  const nonFarm = parseInterventionRows(parseCSV(nonFarmCsv), validPairs);
  const sisd = parseSisdRows(parseCSV(sisdCsv), validPairs);
  const fi = parseInterventionRows(parseCSV(fiCsv), validPairs);

  return buildDashboardData(basic.blocks, { farm: farm, nonFarm: nonFarm, sisd: sisd, fi: fi });
}

function buildDashboardData(blocks, interventions) {
  let totalClfs = 0;
  let totalVos = 0;
  let totalShgs = 0;

  const resultBlocks = (blocks || []).map(block => {
    const clfs = (block.clfs || []).map(clf => {
      totalClfs++;
      totalVos += clf.vo || 0;
      totalShgs += clf.shg || 0;
      return {
        name: clf.name,
        vo: clf.vo || 0,
        shg: clf.shg || 0,
        villages: clf.villages || 0,
        address: clf.address || '',
        landStatus: clf.landStatus || '',
        shgActual: clf.shgActual || '',
        interventions: {
          farm: findInterventionForCLF(interventions.farm, block.name, clf.name),
          nonFarm: findInterventionForCLF(interventions.nonFarm, block.name, clf.name),
          fi: findInterventionForCLF(interventions.fi, block.name, clf.name),
          sisd: findSisdForCLF(interventions.sisd, block.name, clf.name)
        }
      };
    });
    return { name: block.name, clfs: clfs };
  });

  return {
    district: 'West Khasi Hills District',
    summary: { blocks: resultBlocks.length, clfs: totalClfs, vos: totalVos, shgs: totalShgs },
    blocks: resultBlocks
  };
}

// ---------------------------------------------------------------------------
// Apps Script processing (fallback path)
// ---------------------------------------------------------------------------

function processLiveData(data) {
  const result = { district: 'West Khasi Hills District', summary: { blocks: 0, clfs: 0, vos: 0, shgs: 0 }, blocks: [] };

  if (data.blocks) {
    data.blocks.forEach(block => {
      const processedBlock = {
        name: block.name,
        clfs: (block.clfs || []).map(clf => ({
          name: clf.name,
          vo: toInt(clf.vo),
          shg: toInt(clf.shg),
          villages: toInt(clf.villages),
          address: clean(clf.address),
          landStatus: clean(clf.landStatus),
          shgActual: cleanActual(clf.shgActual),
          interventions: {
            farm: findInterventionForCLF(data.farmInterventions, block.name, clf.name),
            nonFarm: findInterventionForCLF(data.nonFarmInterventions, block.name, clf.name),
            fi: findInterventionForCLF(data.fiInterventions, block.name, clf.name),
            sisd: findSisdForCLF(data.sisdInterventions, block.name, clf.name)
          }
        }))
      };
      result.blocks.push(processedBlock);
    });
  }

  result.summary = buildDashboardData(result.blocks, {
    farm: [], nonFarm: [], fi: [], sisd: []
  }).summary;

  return result;
}

function findInterventionForCLF(interventions, blockName, clfName) {
  if (!interventions || interventions.length === 0) {
    return { name: '', brief: '', image: '' };
  }

  const blockLower = (blockName || '').toLowerCase().trim();
  const clfLower = (clfName || '').toLowerCase().trim();

  for (let i = 0; i < interventions.length; i++) {
    const intv = interventions[i] || {};
    const intvBlock = (intv.block || '').toLowerCase().trim();
    const intvCLF = (intv.clfName || '').toLowerCase().trim();

    if (intvBlock === blockLower && intvCLF === clfLower) {
      if (intv.name || intv.brief || intv.image) {
        return {
          name: clean(intv.name),
          brief: clean(intv.brief),
          image: normalizeImageUrl(intv.image)
        };
      }
    }
  }

  return { name: '', brief: '', image: '' };
}

// ---------------------------------------------------------------------------
// Fallback data (matches the Google Spreadsheet as of last known export)
// ---------------------------------------------------------------------------

const fallbackData = {
  district: 'West Khasi Hills District',
  summary: { blocks: 5, clfs: 30, vos: 434, shgs: 2743 },
  blocks: [
    {
      name: 'Mawshynrut',
      clfs: [
        { name: 'JINGKIENG BASKHEM CLF NONGJRI CIRCLE', vo: 12, shg: 47, interventions: { farm: iv('', '', ''), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'KURANGSAL CLF WOMEN MULTI PURPOSE COOPERATIVE SOCIETY', vo: 10, shg: 58, interventions: { farm: iv('', '', ''), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'MAWJAM CLF PORLA', vo: 11, shg: 54, interventions: { farm: iv('', '', ''), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'NONGTREI ASOR CLF', vo: 11, shg: 46, interventions: { farm: iv('', '', ''), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'NONGTREI IONG BI CLUSTER LEVEL FEDERATION UMSOHPIENG', vo: 20, shg: 91, interventions: { farm: iv('', '', ''), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'RYMPEI BAIAR CLUSTER LEVEL FEDERATION CLF', vo: 25, shg: 154, interventions: { farm: iv('', '', ''), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'SAINDUR IA KA LAWEI CLF MULTIPURPOSE COOPERATIVE SOCIETY LTD', vo: 12, shg: 58, interventions: { farm: iv('', '', ''), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } }
      ]
    },
    {
      name: 'Nongstoin',
      clfs: [
        { name: '15 SHNONG CLUSTER LEVEL FEDERATION', vo: 16, shg: 113, interventions: { farm: iv('Poultry Rearing, Poultry Rearing, Agri Nutri Garden, Mushroom Cultivation', 'Poultry Rearing, Poultry Rearing, Agri Nutri Garden, Mushroom Cultivation', 'https://drive.google.com/drive/u/1/folders/1H7MbHsIvhIAyj04uMeCYyWDxwqFz9Upw'), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'DAKA BANTEI CLF', vo: 15, shg: 116, interventions: { farm: iv('Agri Nutri Garden, Poultry Rearing, Poultry Rearing', '', ''), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'IAIKYRSOI CLF', vo: 14, shg: 89, interventions: { farm: iv('Natural Farming, PM Devine (NECTAR)', 'Natural Farming - Beejamruth, Dravajevvamruth, Ghanajeevamruth, Neemastra, Agniastra & Brahmastra.\nGinger Cultivation', 'https://drive.google.com/drive/u/1/folders/1H7MbHsIvhIAyj04uMeCYyWDxwqFz9Upw'), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'IAINEHSKHEM CLF', vo: 11, shg: 82, interventions: { farm: iv('Custom Hiring Centre, Producer Group, Agri Nutri Garden, Poultry Rearing, Poultry Rearing', '', 'https://drive.google.com/file/d/14vPqewF_hcMAbf4PfzSE64TH03EzCsuX/view?usp=drivesdk'), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'KHATWEI CLF PYNDENGREI', vo: 13, shg: 135, interventions: { farm: iv('Integrated Farming Cluster, Producer Group, Agri Nutri Garden, Poultry Rearing, Poultry Rearing', '', 'https://drive.google.com/file/d/14MIK0WuR6gB9tT8YA3oz9eJj38U8-Le3/view?usp=drivesdk'), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'KHAW KYLLA CLF MAWEIT', vo: 16, shg: 74, interventions: { farm: iv('ERI SILK, Producer Group, Agri Nutri Garden, Poultry Rearing, Poultry Rearing, Natural farming', '', 'https://drive.google.com/file/d/1ixcN9_1w8BPfQgig-wIk2yFKnCvSB33U/view?usp=drivesdk'), nonFarm: iv('', 'The CLF has started Eri SILK Weaving', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'KYNHUN SAINDUR CLF MAWIAWET', vo: 13, shg: 108, interventions: { farm: iv('Agri Nutri Garden, Poultry Rearing, Poultry Rearing, Animal Health Care', 'Agri Nutri Garden, Poultry Rearing, Poultry Rearing, Honey Bee Keeping', 'https://drive.google.com/drive/u/1/folders/1H7MbHsIvhIAyj04uMeCYyWDxwqFz9Upw'), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'KYRSHAN IA KA LAWEI CLF', vo: 18, shg: 128, interventions: { farm: iv('Integrated Farming Cluster, Producer Group, Agri Nutri Garden, Poultry Rearing, Poultry Rearing', '', 'https://drive.google.com/file/d/1IxxLFxNndtIUtFSQEvxgK4azpmAEQqtr/view?usp=drivesdk'), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'KYRSIEW CLF RISIANG', vo: 15, shg: 77, interventions: { farm: iv('Paddy Seed Selection, Agri Nutri Garden, Poultry Rearing, Poultry Rearing, Mushroom Cultivation, Surya Mandal', 'Paddy Seed Selection, Agri Nutri Garden, Poultry Rearing, Poultry Rearing, Honey Bee Keeping, Mushroom Cultivation', 'https://drive.google.com/drive/u/1/folders/1H7MbHsIvhIAyj04uMeCYyWDxwqFz9Upw'), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'MAWJAMBASKHEM CLF', vo: 24, shg: 153, interventions: { farm: iv('Producer Group, Agri Nutri Garden, Poultry Rearing, Poultry Rearing, Goatery rearing & Cattle rearing', 'Piggery, poultry, cattle, Goatery', 'https://drive.google.com/file/d/1TJWCHtexYQemY2JxRIQP3HpxzRSYrway/view?usp=drivesdk'), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'SHAT JINSHAICLF LAITKSEH CLUSTER', vo: 18, shg: 164, interventions: { farm: iv('Agri Nutri Garden, Poultry Rearing, Poultry Rearing', '', 'https://drive.google.com/file/d/1tl-z6pHl3S1P-4fnLE20FdSpMr9U2X3y/view?usp=drivesdk'), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'THWEIBIAR CLF NONGSTOIN', vo: 19, shg: 194, interventions: { farm: iv('Saffron Cultivation, Agri Nutri Garden, Mushroom Cultivation, Poultry Rearing, Poultry Rearing, Paddy Seed Selection, Animal Health Care', '', 'https://drive.google.com/drive/u/1/folders/1H7MbHsIvhIAyj04uMeCYyWDxwqFz9Upw'), nonFarm: iv('', 'The CLF started the TCPC Training cum Production Centre', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'WANLAM JONGCHAI CLF WAHLYNGDOH', vo: 12, shg: 54, interventions: { farm: iv('Mushroom Cultivation, Poultry Rearing, Poultry Rearing, Producer Group (Eri Silk)', '', 'https://drive.google.com/drive/u/1/folders/1H7MbHsIvhIAyj04uMeCYyWDxwqFz9Upw'), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } }
      ]
    },
    {
      name: 'Rambrai',
      clfs: [
        { name: 'IATREILANG CLF MAWTHIR', vo: 11, shg: 46, interventions: { farm: iv('ERI SILK, Producer Group, Natural Farming', '', 'https://drive.google.com/drive/u/1/folders/1H7MbHsIvhIAyj04uMeCYyWDxwqFz9Upw'), nonFarm: iv('', 'The CLF has started Eri SILK Weaving', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'KHADHYNNIEW SHNONG CLUSTER LEVEL FEDERATION', vo: 11, shg: 96, interventions: { farm: iv('Integrated Farming Cluster, Poultry Hatchery, PM Devine (NECTAR), Producer Group (Livestock), Vertical Farming', '', 'https://drive.google.com/drive/u/1/folders/1H7MbHsIvhIAyj04uMeCYyWDxwqFz9Upw'), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'SANDAKA CLF MAWDET', vo: 17, shg: 71, interventions: { farm: iv('Ginger Cultivation & Honey Bee keeping (Diya Foundation), Producer Group', '', 'https://drive.google.com/file/d/1I8F93SH2VC6AcXrLYb_G3ZumsU0yEd8i/view?usp=drivesdk'), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'TBEHJINGSHAI CLF MAWDOH', vo: 12, shg: 60, interventions: { farm: iv('PM Devine (NECTAR), Agri Nutri Garden, Poultry Rearing, Poultry Rearing', '', 'https://drive.google.com/file/d/1gRZdphwfbzVXwdvbz_pxEFWI1vC6OFk8/view?usp=drivesdk'), nonFarm: iv('', 'The CLF with the EC has decided to start Handicraft activities', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'WOMEN UNITED CLF RAMBRAI', vo: 12, shg: 114, interventions: { farm: iv('Producer Group, Natural Farming Project, Agri Nutri Garden, Poultry Rearing, Poultry Rearing', '', 'https://drive.google.com/file/d/1JvxnGynyU_IoKpG0LdSgUeOvjLQisQ7b/view?usp=drivesdk'), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } }
      ]
    },
    {
      name: 'RI-Muliang',
      clfs: [
        { name: 'BIRONGDIK CLF', vo: 13, shg: 73, interventions: { farm: iv('', '', ''), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'IATYLLI BAN ROI CLF', vo: 21, shg: 91, interventions: { farm: iv('', '', ''), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'TENGKAME CLF', vo: 12, shg: 69, interventions: { farm: iv('', '', ''), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } },
        { name: 'TWAR BAN SAN CLF KYRDUM', vo: 10, shg: 67, interventions: { farm: iv('', '', ''), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } }
      ]
    },
    {
      name: 'Shallang',
      clfs: [
        { name: 'NIASON CLF UMDANG', vo: 10, shg: 61, interventions: { farm: iv('', '', ''), nonFarm: iv('', '', ''), fi: iv('Saksham Centre', '', '') } }
      ]
    }
  ]
};

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

// SISD fallback data (child care support, transit homes) per CLF from the sheet
const fallbackSisd = {
  'JINGKIENG BASKHEM CLF NONGJRI CIRCLE': { childCare: '8' },
  'KURANGSAL CLF WOMEN MULTI PURPOSE COOPERATIVE SOCIETY': { childCare: '6' },
  'MAWJAM CLF PORLA': { childCare: '5' },
  'NONGTREI ASOR CLF': { childCare: '6' },
  'NONGTREI IONG BI CLUSTER LEVEL FEDERATION UMSOHPIENG': { childCare: '6' },
  'RYMPEI BAIAR CLUSTER LEVEL FEDERATION CLF': { childCare: '4' },
  'SAINDUR IA KA LAWEI CLF MULTIPURPOSE COOPERATIVE SOCIETY LTD': { childCare: '3' },
  '15 SHNONG CLUSTER LEVEL FEDERATION': { childCare: '2' },
  'DAKA BANTEI CLF': { childCare: '5' },
  'KHAW KYLLA CLF MAWEIT': { transitHome: 'Transit Home at Maweit PHC run by VO' },
  'MAWJAMBASKHEM CLF': { transitHome: 'Transit Home at Mawkadiang run by VO' },
  'KHADHYNNIEW SHNONG CLUSTER LEVEL FEDERATION': { transitHome: 'Transit Home at Rambrai PHC run by VO' },
  'TENGKAME CLF': { transitHome: 'Transit Home at Aradonga PHC run by VO' }
};

// Basic details fallback per CLF from the sheet (villages, actual SHG; address/land empty in sheet)
const fallbackBasic = {
  'JINGKIENG BASKHEM CLF NONGJRI CIRCLE': { villages: 11, shgActual: '' },
  'KURANGSAL CLF WOMEN MULTI PURPOSE COOPERATIVE SOCIETY': { villages: 17, shgActual: '67' },
  'MAWJAM CLF PORLA': { villages: 13, shgActual: '' },
  'NONGTREI ASOR CLF': { villages: 14, shgActual: '' },
  'NONGTREI IONG BI CLUSTER LEVEL FEDERATION UMSOHPIENG': { villages: 21, shgActual: '' },
  'RYMPEI BAIAR CLUSTER LEVEL FEDERATION CLF': { villages: 26, shgActual: '147' },
  'SAINDUR IA KA LAWEI CLF MULTIPURPOSE COOPERATIVE SOCIETY LTD': { villages: 12, shgActual: '' },
  '15 SHNONG CLUSTER LEVEL FEDERATION': { villages: 14, shgActual: '114' },
  'DAKA BANTEI CLF': { villages: 68, shgActual: '' },
  'IAIKYRSOI CLF': { villages: 14, shgActual: '94' },
  'IAINEHSKHEM CLF': { villages: 12, shgActual: '86' },
  'KHATWEI CLF PYNDENGREI': { villages: 5, shgActual: '130' },
  'KHAW KYLLA CLF MAWEIT': { villages: 16, shgActual: '84' },
  'KYNHUN SAINDUR CLF MAWIAWET': { villages: 1, shgActual: '' },
  'KYRSHAN IA KA LAWEI CLF': { villages: 16, shgActual: '131' },
  'KYRSIEW CLF RISIANG': { villages: 15, shgActual: '77' },
  'MAWJAMBASKHEM CLF': { villages: 23, shgActual: '160' },
  'SHAT JINSHAICLF LAITKSEH CLUSTER': { villages: 3, shgActual: '' },
  'THWEIBIAR CLF NONGSTOIN': { villages: 9, shgActual: '212' },
  'WANLAM JONGCHAI CLF WAHLYNGDOH': { villages: 14, shgActual: '59' },
  'IATREILANG CLF MAWTHIR': { villages: 12, shgActual: '50' },
  'KHADHYNNIEW SHNONG CLUSTER LEVEL FEDERATION': { villages: 12, shgActual: '137' },
  'SANDAKA CLF MAWDET': { villages: 16, shgActual: '71' },
  'TBEHJINGSHAI CLF MAWDOH': { villages: 13, shgActual: '79' },
  'WOMEN UNITED CLF RAMBRAI': { villages: 13, shgActual: '120' },
  'BIRONGDIK CLF': { villages: 17, shgActual: '97' },
  'IATYLLI BAN ROI CLF': { villages: 20, shgActual: '92' },
  'TENGKAME CLF': { villages: 12, shgActual: '95' },
  'TWAR BAN SAN CLF KYRDUM': { villages: 10, shgActual: '81' },
  'NIASON CLF UMDANG': { villages: 11, shgActual: '' }
};

fallbackData.blocks.forEach(block => {
  block.clfs.forEach(clf => {
    const s = fallbackSisd[clf.name];
    clf.interventions.sisd = s
      ? sis(s.childCare, s.transitHome, s.followUp, s.vrf)
      : sis('', '', '', '');

    const b = fallbackBasic[clf.name] || {};
    clf.villages = b.villages || 0;
    clf.address = b.address || '';
    clf.landStatus = b.landStatus || '';
    clf.shgActual = b.shgActual || '';
  });
});

let dashboardData = null;

async function fetchLiveData() {
  // 1) Directly from the Google Spreadsheet (keeps the dashboard in sync with the sheet)
  try {
    const data = await buildFromSpreadsheet();
    if (data && data.blocks && data.blocks.length > 0) {
      console.log('Using live data from Google Spreadsheet');
      return data;
    }
    console.warn('Spreadsheet returned no blocks, falling through');
  } catch (error) {
    console.warn('Failed to fetch spreadsheet data:', error.message);
  }

  // 2) Apps Script web app
  if (APPS_SCRIPT_URL && APPS_SCRIPT_URL !== 'YOUR_APPS_SCRIPT_URL_HERE') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(APPS_SCRIPT_URL, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      const processed = processLiveData(data);
      if (processed.blocks && processed.blocks.length > 0) {
        console.log('Using live data from Apps Script');
        return processed;
      }
    } catch (error) {
      console.warn('Failed to fetch live data from Apps Script:', error.message);
    }
  }

  // 3) Embedded fallback data
  console.log('Using fallback data');
  return fallbackData;
}

async function initDashboard() {
  dashboardData = await fetchLiveData();
  return dashboardData;
}
