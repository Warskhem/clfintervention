// Google Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw6SnXISZM0KaowpSYTCeaQzhBYwj5jejcQZl4qqvIRq8zhXtfcFxzfpwws74EyO94vzw/exec';

const fallbackData = {
  district: "West Khasi Hills District",
  summary: { blocks: 5, clfs: 30, vos: 389, shgs: 2371 },
  blocks: [
    {
      name: "Mawshynrut",
      clfs: [
        { name: "JINGKIENG BASKHEM CLF NONGJRI CIRCLE", vo: 12, shg: 47, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "KURANGSAL CLF WOMEN MULTI PURPOSE COOPERATIVE SOCIETY", vo: 10, shg: 58, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "MAWJAM CLF PORLA", vo: 11, shg: 54, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "NONGTREI ASOR CLF", vo: 11, shg: 46, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "NONGTREI IONG BI CLUSTER LEVEL FEDERATION UMSOHPIENG", vo: 20, shg: 91, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "RYMPEI BAIAR CLUSTER LEVEL FEDERATION CLF", vo: 25, shg: 154, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "SAINDUR IA KA LAWEI CLF MULTIPURPOSE COOPERATIVE SOCIETY LTD", vo: 12, shg: 58, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } }
      ]
    },
    {
      name: "Nongstoin",
      clfs: [
        { name: "15 SHNONG CLUSTER LEVEL FEDERATION", vo: 16, shg: 113, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "DAKA BANTEI CLF", vo: 1, shg: 16, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "IAIKYRSOI CLF", vo: 14, shg: 89, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "IAINEHSKHEM CLF", vo: 11, shg: 82, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "KHATWEI CLF PYNDENGREI", vo: 13, shg: 135, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "KHAW KYLLA CLF MAWEIT", vo: 16, shg: 74, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "KYNHUN SAINDUR CLF MAWIAWET", vo: 0, shg: 0, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "KYRSHAN IA KA LAWEI CLF", vo: 18, shg: 128, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "KYRSIEW CLF RISIANG", vo: 15, shg: 77, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "MAWJAMBASKHEM CLF", vo: 24, shg: 153, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "SHAT JINSHAICLF LAITKSEH CLUSTER", vo: 0, shg: 0, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "THWEIBIAR CLF NONGSTOIN", vo: 19, shg: 194, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "WANLAM JONGCHAI CLF WAHLYNGDOH", vo: 12, shg: 54, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } }
      ]
    },
    {
      name: "Rambrai",
      clfs: [
        { name: "IATREILANG CLF MAWTHIR", vo: 11, shg: 46, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "KHADHYNNIEW SHNONG CLUSTER LEVEL FEDERATION", vo: 11, shg: 96, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "SANDAKA CLF MAWDET", vo: 17, shg: 71, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "TBEHJINGSHAI CLF MAWDOH", vo: 12, shg: 60, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "WOMEN UNITED CLF RAMBRAI", vo: 12, shg: 114, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } }
      ]
    },
    {
      name: "RI-Muliang",
      clfs: [
        { name: "BIRONGDIK CLF", vo: 13, shg: 73, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "IATYLLI BAN ROI CLF", vo: 21, shg: 91, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "TENGKAME CLF", vo: 12, shg: 69, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "TWAR BAN SAN CLF KYRDUM", vo: 10, shg: 67, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } }
      ]
    },
    {
      name: "Shallang",
      clfs: [
        { name: "NIASON CLF UMDANG", vo: 10, shg: 61, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } }
      ]
    }
  ]
};

// FI intervention data sourced from the FIIntervention CSV (Saksham Centre)
const fiData = [
    { block: "Mawshynrut", clf: "JINGKIENG BASKHEM CLF NONGJRI CIRCLE", cif: 0, vrf: 0, startup: 200000, loans: 45, bc: 2 },
    { block: "Mawshynrut", clf: "KURANGSAL CLF WOMEN MULTI PURPOSE COOPERATIVE SOCIETY", cif: 1350000, vrf: 0, startup: 350000, loans: 44, bc: 1 },
    { block: "Mawshynrut", clf: "MAWJAM CLF PORLA", cif: 3570000, vrf: 0, startup: 350000, loans: 1, bc: 0 },
    { block: "Mawshynrut", clf: "NONGTREI ASOR CLF", cif: 0, vrf: 0, startup: 200000, loans: 39, bc: 0 },
    { block: "Mawshynrut", clf: "NONGTREI IONG BI CLUSTER LEVEL FEDERATION UMSOHPIENG", cif: 600000, vrf: 0, startup: 350000, loans: 45, bc: 2 },
    { block: "Mawshynrut", clf: "RYMPEI BAIAR CLUSTER LEVEL FEDERATION CLF", cif: 18590000, vrf: 0, startup: 350000, loans: 116, bc: 3 },
    { block: "Mawshynrut", clf: "SAINDUR IA KA LAWEI CLF MULTIPURPOSE COOPERATIVE SOCIETY LTD", cif: 5610000, vrf: 0, startup: 350000, loans: 30, bc: 1 },
    { block: "Nongstoin", clf: "15 SHNONG CLUSTER LEVEL FEDERATION", cif: 5910000, vrf: 0, startup: 350000, loans: 72, bc: 3 },
    { block: "Nongstoin", clf: "DAKA BANTEI CLF", cif: 110000, vrf: 0, startup: 200000, loans: 33, bc: 4 },
    { block: "Nongstoin", clf: "IAIKYRSOI CLF", cif: 0, vrf: 0, startup: 350000, loans: 62, bc: 2 },
    { block: "Nongstoin", clf: "IAINEHSKHEM CLF", cif: 0, vrf: 0, startup: 350000, loans: 24, bc: 1 },
    { block: "Nongstoin", clf: "KHATWEI CLF PYNDENGREI", cif: 6250000, vrf: 0, startup: 350000, loans: 48, bc: 2 },
    { block: "Nongstoin", clf: "KHAW KYLLA CLF MAWEIT", cif: 0, vrf: 0, startup: 350000, loans: 27, bc: 2 },
    { block: "Nongstoin", clf: "KYNHUN SAINDUR CLF MAWIAWET", cif: 8390000, vrf: 0, startup: 200000, loans: 41, bc: 1 },
    { block: "Nongstoin", clf: "KYRSHAN IA KA LAWEI CLF", cif: 0, vrf: 0, startup: 0, loans: 65, bc: 3 },
    { block: "Nongstoin", clf: "KYRSIEW CLF RISIANG", cif: 4020000, vrf: 0, startup: 350000, loans: 25, bc: 0 },
    { block: "Nongstoin", clf: "MAWJAMBASKHEM CLF", cif: 7670000, vrf: 0, startup: 350000, loans: 67, bc: 2 },
    { block: "Nongstoin", clf: "SHAT JINSHAICLF LAITKSEH CLUSTER", cif: 0, vrf: 0, startup: 200000, loans: 79, bc: 2 },
    { block: "Nongstoin", clf: "THWEIBIAR CLF NONGSTOIN", cif: 11550000, vrf: 0, startup: 350000, loans: 131, bc: 4 },
    { block: "Nongstoin", clf: "WANLAM JONGCHAI CLF WAHLYNGDOH", cif: 0, vrf: 0, startup: 350000, loans: 5, bc: 1 },
    { block: "Rambrai", clf: "IATREILANG CLF MAWTHIR", cif: 2250000, vrf: 0, startup: 350000, loans: 15, bc: 2 },
    { block: "Rambrai", clf: "KHADHYNNIEW SHNONG CLUSTER LEVEL FEDERATION", cif: 10040000, vrf: 0, startup: 350000, loans: 50, bc: 1 },
    { block: "Rambrai", clf: "SANDAKA CLF MAWDET", cif: 0, vrf: 0, startup: 0, loans: 47, bc: 2 },
    { block: "Rambrai", clf: "TBEHJINGSHAI CLF MAWDOH", cif: 0, vrf: 0, startup: 350000, loans: 25, bc: 1 },
    { block: "Rambrai", clf: "WOMEN UNITED CLF RAMBRAI", cif: 5990000, vrf: 0, startup: 350000, loans: 79, bc: 1 },
    { block: "RI-Muliang", clf: "BIRONGDIK CLF", cif: 7810000, vrf: 0, startup: 350000, loans: 73, bc: 1 },
    { block: "RI-Muliang", clf: "IATYLLI BAN ROI CLF", cif: 5260000, vrf: 0, startup: 350000, loans: 64, bc: 1 },
    { block: "RI-Muliang", clf: "TENGKAME CLF", cif: 7210000, vrf: 0, startup: 350000, loans: 69, bc: 1 },
    { block: "RI-Muliang", clf: "TWAR BAN SAN CLF KYRDUM", cif: 4070000, vrf: 0, startup: 350000, loans: 58, bc: 2 },
    { block: "Shallang", clf: "NIASON CLF UMDANG", cif: 2030000, vrf: 0, startup: 350000, loans: 44, bc: 1 }
];

function fillValue(current, fallback) {
  return (current === undefined || current === null || current === "") ? fallback : current;
}

function applyFiData(blocks) {
  if (!blocks || blocks.length === 0) return;
  blocks.forEach(block => {
    block.clfs.forEach(clf => {
      const row = fiData.find(r => r.block === block.name && r.clf === clf.name);
      if (!row) return;
      const fi = clf.interventions.fi;
      if (!fi.name) fi.name = "Saksham Centre";
      fi.cifFund = fillValue(fi.cifFund, row.cif);
      fi.vrfFund = fillValue(fi.vrfFund, row.vrf);
      fi.startupFund = fillValue(fi.startupFund, row.startup);
      fi.bankLoan = fillValue(fi.bankLoan, row.loans);
      fi.bc = fillValue(fi.bc, row.bc);
    });
  });
}

let dashboardData = null;

async function fetchLiveData() {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
    console.log('Using fallback data - Apps Script URL not configured');
    return fallbackData;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(APPS_SCRIPT_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    console.log('Raw live data from Apps Script:', data);
    const processed = processLiveData(data);
    if (!processed.blocks || processed.blocks.length === 0) {
      console.warn('Live data returned no blocks, using fallback');
      return fallbackData;
    }
    return processed;
  } catch (error) {
    console.warn('Failed to fetch live data, using fallback:', error.message);
    return fallbackData;
  }
}

function processLiveData(data) {
  const result = {
    district: "West Khasi Hills District",
    summary: data.summary || { blocks: 0, clfs: 0, vos: 0, shgs: 0 },
    blocks: []
  };

  if (data.blocks) {
    data.blocks.forEach(block => {
      const processedBlock = {
        name: block.name,
        clfs: block.clfs.map(clf => ({
          name: clf.name,
          vo: clf.vo || 0,
          shg: clf.shg || 0,
          interventions: {
            farm: findInterventionForCLF(data.farmInterventions, block.name, clf.name),
            nonFarm: findInterventionForCLF(data.nonFarmInterventions, block.name, clf.name),
            fi: findInterventionForCLF(data.fiInterventions, block.name, clf.name)
          }
        }))
      };
      result.blocks.push(processedBlock);
    });
  }

  console.log('Processed dashboard data:', result);
  return result;
}

function findInterventionForCLF(interventions, blockName, clfName) {
  if (!interventions || interventions.length === 0) {
    return { name: "", brief: "", image: "" };
  }

  var blockLower = blockName.toLowerCase().trim();
  var clfLower = clfName.toLowerCase().trim();

  for (var i = 0; i < interventions.length; i++) {
    var intv = interventions[i];
    var intvBlock = (intv.block || "").toLowerCase().trim();
    var intvCLF = (intv.clfName || "").toLowerCase().trim();

    if (intvBlock === blockLower && intvCLF === clfLower) {
      if (intv.name) {
        return {
          name: intv.name,
          brief: intv.brief || "",
          image: intv.image || "",
          cifFund: intv.cifFund || 0,
          vrfFund: intv.vrfFund || 0,
          startupFund: intv.startupFund || 0,
          bankLoan: intv.bankLoan || 0,
          bc: intv.bc || 0,
          pmjjy: intv.pmjjy || "No Data",
          pmsby: intv.pmsby || "No Data",
          mhis: intv.mhis || "No Data"
        };
      }
    }
  }

  return { name: "", brief: "", image: "" };
}

async function initDashboard() {
  dashboardData = await fetchLiveData();
  applyFiData(dashboardData.blocks);
  return dashboardData;
}
