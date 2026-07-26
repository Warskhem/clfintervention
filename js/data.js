// Google Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwAszo2tJG-00c8JdkgedaoGSDKiLlrPOHUpTgC75c64S1UtCQhDHTWREYGV6K4Ekg-cA/exec';

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
    return processLiveData(data);
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
          image: intv.image || ""
        };
      }
    }
  }

  return { name: "", brief: "", image: "" };
}

async function initDashboard() {
  dashboardData = await fetchLiveData();
  return dashboardData;
}
