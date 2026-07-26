// Google Apps Script Web App URL - Replace with your published URL
// To get this URL: Deploy > New deployment > Web app > Copy URL
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';

// Static fallback data (used if live fetch fails)
const fallbackData = {
  district: "West Khasi Hills District",
  summary: {
    blocks: 5,
    clfs: 30,
    vos: 389,
    shgs: 2371
  },
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
        { name: "KYNHUN SAINDUR CLF MAWIAWET-01", vo: 0, shg: 0, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "KYRSHAN IA KA LAWEI CLF", vo: 18, shg: 128, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "KYRSIEW CLF RISIANG", vo: 15, shg: 77, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "MAWJAMBASKHEM CLF", vo: 24, shg: 153, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
        { name: "SHAT JINSHAICLF LAITKSEH CLUSTER-0", vo: 0, shg: 0, interventions: { farm: { name: "", brief: "", image: "" }, nonFarm: { name: "", brief: "", image: "" }, fi: { name: "", brief: "", image: "" } } },
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

// Global variable to hold dashboard data
let dashboardData = null;

// Fetch live data from Google Apps Script
async function fetchLiveData() {
  if (APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
    console.log('Using fallback data - Apps Script URL not configured');
    return fallbackData;
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return processLiveData(data);
  } catch (error) {
    console.warn('Failed to fetch live data, using fallback:', error);
    return fallbackData;
  }
}

// Process live data from Apps Script into dashboard format
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
          vo: clf.vo,
          shg: clf.shg,
          interventions: {
            farm: findIntervention(data.farmInterventions, clf.name, data.images),
            nonFarm: findIntervention(data.nonFarmInterventions, clf.name, data.images),
            fi: findIntervention(data.fiInterventions, clf.name, data.images)
          }
        }))
      };
      result.blocks.push(processedBlock);
    });
  }

  return result;
}

// Find intervention data for a CLF
function findIntervention(interventions, clfName, images) {
  if (!interventions) {
    return { name: "", brief: "", image: "" };
  }

  // Try to find intervention matching the CLF name or block name
  for (let i = 0; i < interventions.length; i++) {
    const intervention = interventions[i];
    if (intervention.brief && clfName.toLowerCase().includes(intervention.brief.toLowerCase())) {
      return {
        name: intervention.name,
        brief: intervention.brief,
        image: intervention.image || (images && images[intervention.name]) || ""
      };
    }
  }

  return { name: "", brief: "", image: "" };
}

// Initialize dashboard data
async function initDashboard() {
  dashboardData = await fetchLiveData();
  return dashboardData;
}
