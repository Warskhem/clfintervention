var SPREADSHEET_ID = '140SeRjUIztuJG6F6SDRAkz3z5vlbA07kH0UZG17M1Wo';

function doGet(e) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var allSheets = ss.getSheets();
  var result = {
    blocks: [],
    farmInterventions: [],
    nonFarmInterventions: [],
    sisdInterventions: [],
    fiInterventions: [],
    summary: { blocks: 0, clfs: 0, vos: 0, shgs: 0 }
  };

  for (var s = 0; s < allSheets.length; s++) {
    var sheet = allSheets[s];
    var data = sheet.getDataRange().getValues();
    if (!data || data.length < 2) continue;

    var firstCell = data[0][0] ? data[0][0].toString().toLowerCase() : "";

    if (firstCell.indexOf("district") !== -1 ||
        firstCell.indexOf("distirct") !== -1 ||
        firstCell.indexOf("basic") !== -1) {
      result.blocks = parseBasicDetails(data);
    } else if (firstCell.indexOf("farm") !== -1 && firstCell.indexOf("non") === -1) {
      result.farmInterventions = parseInterventions(data);
    } else if (firstCell.indexOf("nonfarm") !== -1 || firstCell.indexOf("non farm") !== -1) {
      result.nonFarmInterventions = parseInterventions(data);
    } else if (firstCell.indexOf("sisd") !== -1) {
      result.sisdInterventions = parseSisd(data);
    } else if (firstCell.indexOf("fi") !== -1) {
      result.fiInterventions = parseInterventions(data);
    }
  }

  // Build a set of valid Block::CLF pairs so junk/total rows are filtered out
  var validPairs = buildValidPairs(result.blocks);
  result.farmInterventions = filterInterventions(result.farmInterventions, validPairs);
  result.nonFarmInterventions = filterInterventions(result.nonFarmInterventions, validPairs);
  result.sisdInterventions = filterInterventions(result.sisdInterventions, validPairs);
  result.fiInterventions = filterInterventions(result.fiInterventions, validPairs);

  for (var b = 0; b < result.blocks.length; b++) {
    result.summary.clfs += result.blocks[b].clfs.length;
    for (var c = 0; c < result.blocks[b].clfs.length; c++) {
      result.summary.vos += result.blocks[b].clfs[c].vo;
      result.summary.shgs += result.blocks[b].clfs[c].shg;
    }
  }
  result.summary.blocks = result.blocks.length;

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function buildValidPairs(blocks) {
  var pairs = {};
  for (var b = 0; b < blocks.length; b++) {
    var block = blocks[b];
    for (var c = 0; c < block.clfs.length; c++) {
      pairs[(block.name || "").toLowerCase() + "::" + (block.clfs[c].name || "").toLowerCase()] = true;
    }
  }
  return pairs;
}

function filterInterventions(interventions, validPairs) {
  if (!interventions) return [];
  var out = [];
  for (var i = 0; i < interventions.length; i++) {
    var intv = interventions[i];
    if (!intv) continue;
    var key = (intv.block || "").toLowerCase() + "::" + (intv.clfName || "").toLowerCase();
    if (validPairs[key]) out.push(intv);
  }
  return out;
}

function findCol(header, keywords) {
  for (var i = 0; i < header.length; i++) {
    var cell = header[i] ? header[i].toString().toLowerCase().trim() : "";
    for (var k = 0; k < keywords.length; k++) {
      if (cell.indexOf(keywords[k]) !== -1) return i;
    }
  }
  return -1;
}

function findHeaderRowIndex(data) {
  for (var i = 0; i < data.length; i++) {
    var row = data[i] || [];
    if (findCol(row, ["block"]) !== -1 && findCol(row, ["clf name", "clf"]) !== -1) return i;
  }
  return -1;
}

function parseBasicDetails(data) {
  var headerIndex = findHeaderRowIndex(data);
  if (headerIndex === -1) return [];
  var header = data[headerIndex];
  var colBlock = findCol(header, ["block"]);
  var colCLF = findCol(header, ["clf name", "clf"]);
  var colVO = findCol(header, ["vo"]);
  var colSHG = findCol(header, ["shg"]);
  var colVillages = findCol(header, ["villages", "village"]);
  var colAddress = findCol(header, ["address", "adress", "addr"]);
  var colLand = findCol(header, ["land"]);
  var colActual = findCol(header, ["actual"]);

  var blocks = {};
  for (var i = headerIndex + 1; i < data.length; i++) {
    var row = data[i];
    var blockName = (row[colBlock] || "").toString().trim();
    var clfName = (row[colCLF] || "").toString().trim();
    var vo = colVO !== -1 ? toInt(row[colVO]) : 0;
    var shg = colSHG !== -1 ? toInt(row[colSHG]) : 0;
    var villages = colVillages !== -1 ? toInt(row[colVillages]) : 0;
    var address = colAddress !== -1 ? (row[colAddress] || "").toString().trim() : "";
    var landStatus = colLand !== -1 ? (row[colLand] || "").toString().trim() : "";
    var shgActual = colActual !== -1 ? cleanActual(row[colActual]) : "";
    if (!blockName || !clfName) continue;
    if (isJunkName(blockName) || isJunkName(clfName)) continue;

    if (!blocks[blockName]) blocks[blockName] = { name: blockName, clfs: [] };
    blocks[blockName].clfs.push({ name: clfName, vo: vo, shg: shg, villages: villages, address: address, landStatus: landStatus, shgActual: shgActual });
  }

  var arr = [];
  for (var key in blocks) {
    if (blocks[key].clfs.length > 0) arr.push(blocks[key]);
  }
  return arr;
}

function cleanActual(value) {
  var v = (value || "").toString().trim();
  if (!v || /no data/i.test(v)) return "";
  return v;
}

function parseInterventions(data) {
  var headerIndex = findHeaderRowIndex(data);
  if (headerIndex === -1) return [];
  var header = data[headerIndex];
  var colBlock = findCol(header, ["block"]);
  var colCLF = findCol(header, ["clf name", "clf"]);
  var colName = findCol(header, ["intervention", "name of intervention"]);
  var colBrief = findCol(header, ["brief"]);
  var colImage = findCol(header, ["image", "link"]);
  var colCIF = findCol(header, ["cif"]);
  var colVRF = findCol(header, ["vrf"]);
  var colStartup = findCol(header, ["start up", "startup", "start-up"]);
  var colLoan = findCol(header, ["bank loan"]);
  var colBC = findCol(header, ["bc at the clf", "bc"]);
  var colPMJJY = findCol(header, ["pmjjy"]);
  var colPMSBY = findCol(header, ["pmsby"]);
  var colMHIS = findCol(header, ["mhis"]);

  var hasBlockCol = colBlock !== -1 && colCLF !== -1;
  var results = [];

  for (var i = headerIndex + 1; i < data.length; i++) {
    var row = data[i];
    if (!row) continue;

    var block = "", clfName = "", intervention = "", brief = "", image = "";

    if (hasBlockCol) {
      block = (row[colBlock] || "").toString().trim();
      clfName = (row[colCLF] || "").toString().trim();
      intervention = colName !== -1 ? (row[colName] || "").toString().trim() : "";
      brief = colBrief !== -1 ? (row[colBrief] || "").toString().trim() : "";
      image = colImage !== -1 ? (row[colImage] || "").toString().trim() : "";
    } else {
      intervention = colName !== -1 ? (row[colName] || "").toString().trim() : "";
      brief = colBrief !== -1 ? (row[colBrief] || "").toString().trim() : "";
      image = colImage !== -1 ? (row[colImage] || "").toString().trim() : "";
    }

    if (!clfName || isJunkName(clfName)) continue;
    if (!block) continue;
    if (!intervention && !brief && !image) continue;

    results.push({
      block: block,
      clfName: clfName,
      name: intervention,
      brief: brief,
      image: convertDriveLink(image),
      cifFund: colCIF !== -1 ? parseNumber(row[colCIF]) : 0,
      vrfFund: colVRF !== -1 ? parseNumber(row[colVRF]) : 0,
      startupFund: colStartup !== -1 ? parseNumber(row[colStartup]) : 0,
      bankLoan: colLoan !== -1 ? parseNumber(row[colLoan]) : 0,
      bc: colBC !== -1 ? parseNumber(row[colBC]) : 0,
      pmjjy: colPMJJY !== -1 ? (row[colPMJJY] || "").toString().trim() : "No Data",
      pmsby: colPMSBY !== -1 ? (row[colPMSBY] || "").toString().trim() : "No Data",
      mhis: colMHIS !== -1 ? (row[colMHIS] || "").toString().trim() : "No Data"
    });
  }
  return results;
}

function parseNumber(v) {
  if (v === null || v === undefined || v === "") return 0;
  var n = parseInt(String(v).replace(/[,\s\u20B9\u00A0]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

function parseSisd(data) {
  var headerIndex = findHeaderRowIndex(data);
  if (headerIndex === -1) return [];
  var header = data[headerIndex];
  var colBlock = findCol(header, ["block"]);
  var colCLF = findCol(header, ["clf name", "clf"]);
  var colChild = findCol(header, ["child care"]);
  var colTransit = findCol(header, ["transit home"]);
  var colFollowUp = findCol(header, ["follow up", "pregnant"]);
  var colVRF = findCol(header, ["vrf", "sam/mam"]);

  var results = [];
  for (var i = headerIndex + 1; i < data.length; i++) {
    var row = data[i];
    if (!row) continue;

    var block = (row[colBlock] || "").toString().trim();
    var clfName = (row[colCLF] || "").toString().trim();
    var childCare = colChild !== -1 ? (row[colChild] || "").toString().trim() : "";
    var transitHome = colTransit !== -1 ? (row[colTransit] || "").toString().trim() : "";
    var followUp = colFollowUp !== -1 ? (row[colFollowUp] || "").toString().trim() : "";
    var vrf = colVRF !== -1 ? (row[colVRF] || "").toString().trim() : "";

    if (!block || !clfName || isJunkName(clfName)) continue;
    if (!childCare && !transitHome && !followUp && !vrf) continue;

    results.push({
      block: block,
      clfName: clfName,
      childCare: childCare,
      transitHome: transitHome,
      followUp: followUp,
      vrf: vrf
    });
  }
  return results;
}

function isJunkName(name) {
  var n = (name || "").toLowerCase();
  if (!n) return true;
  if (/\d+-block/i.test(n) || /\d+-clf/i.test(n)) return true;
  if (/(^|\s)total(\s|$)/i.test(n)) return true;
  if (/no data/i.test(n)) return true;
  if (/no clf/i.test(n)) return true;
  return false;
}

function toInt(value) {
  var n = parseInt(String(value || "").replace(/[^0-9-]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}
  return isNaN(n) ? 0 : n;
}

function convertDriveLink(link) {
  if (!link) return "";
  link = link.toString().trim();
  var match = link.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return "https://drive.google.com/uc?export=view&id=" + match[1];
  match = link.match(/drive\.google\.com\/(?:drive\/)?(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/);
  if (match) return link;
  match = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return "https://drive.google.com/uc?export=view&id=" + match[1];
  if (/^https?:\/\//i.test(link)) return link;
  return "";
}
