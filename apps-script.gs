function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allSheets = ss.getSheets();
  var result = {
    blocks: [],
    farmInterventions: [],
    nonFarmInterventions: [],
    fiInterventions: [],
    summary: { blocks: 0, clfs: 0, vos: 0, shgs: 0 }
  };

  for (var s = 0; s < allSheets.length; s++) {
    var sheet = allSheets[s];
    var data = sheet.getDataRange().getValues();
    if (!data || data.length < 2) continue;

    var firstCell = data[0][0] ? data[0][0].toString().toLowerCase() : "";

    if (firstCell.indexOf("district") !== -1) {
      result.blocks = parseBasicDetails(data);
    } else if (firstCell.indexOf("farm") !== -1 && firstCell.indexOf("non") === -1) {
      result.farmInterventions = parseInterventions(data);
    } else if (firstCell.indexOf("nonfarm") !== -1 || firstCell.indexOf("non farm") !== -1) {
      result.nonFarmInterventions = parseInterventions(data);
    } else if (firstCell.indexOf("fi") !== -1) {
      result.fiInterventions = parseInterventions(data);
    }
  }

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

function findCol(header, keywords) {
  for (var i = 0; i < header.length; i++) {
    var cell = header[i] ? header[i].toString().toLowerCase().trim() : "";
    for (var k = 0; k < keywords.length; k++) {
      if (cell.indexOf(keywords[k]) !== -1) return i;
    }
  }
  return -1;
}

function parseBasicDetails(data) {
  var header = data[0];
  var colBlock = findCol(header, ["block"]);
  var colCLF = findCol(header, ["clf name", "clf"]);
  var colVO = findCol(header, ["vo"]);
  var colSHG = findCol(header, ["shg"]);

  if (colBlock === -1 || colCLF === -1) return [];

  var blocks = {};
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var blockName = (row[colBlock] || "").toString().trim();
    var clfName = (row[colCLF] || "").toString().trim();
    var vo = colVO !== -1 ? (parseInt(row[colVO]) || 0) : 0;
    var shg = colSHG !== -1 ? (parseInt(row[colSHG]) || 0) : 0;
    if (!blockName || !clfName) continue;
    if (/\d+-block/i.test(blockName) || /\d+-clf/i.test(clfName)) continue;

    if (!blocks[blockName]) blocks[blockName] = { name: blockName, clfs: [] };
    blocks[blockName].clfs.push({ name: clfName, vo: vo, shg: shg });
  }

  var arr = [];
  for (var key in blocks) {
    if (blocks[key].clfs.length > 0) arr.push(blocks[key]);
  }
  return arr;
}

function parseInterventions(data) {
  var header = data[0];
  var colBlock = findCol(header, ["block"]);
  var colCLF = findCol(header, ["clf name", "clf"]);
  var colName = findCol(header, ["intervention", "name of intervention"]);
  var colBrief = findCol(header, ["brief"]);
  var colImage = findCol(header, ["image", "link"]);

  var hasBlockCol = colBlock !== -1 && colCLF !== -1;
  var results = [];

  for (var i = 1; i < data.length; i++) {
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

    if (!intervention && !brief && !block && !clfName) continue;
    if (/\d+-block/i.test(block) || /\d+-clf/i.test(clfName)) continue;

    results.push({
      block: block,
      clfName: clfName,
      name: intervention,
      brief: brief,
      image: convertDriveLink(image)
    });
  }
  return results;
}

function convertDriveLink(link) {
  if (!link) return "";
  link = link.toString().trim();
  var match = link.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return "https://drive.google.com/uc?export=view&id=" + match[1];
  match = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return "https://drive.google.com/uc?export=view&id=" + match[1];
  return link;
}
