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

    var header = data[0].join(" ").toLowerCase();
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

function parseBasicDetails(data) {
  var blocks = {};
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var blockName = (row[1] || "").toString().trim();
    var clfName = (row[3] || "").toString().trim();
    var vo = parseInt(row[4]) || 0;
    var shg = parseInt(row[5]) || 0;
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
  var results = [];
  var header = data[0].join(" ").toLowerCase();
  var hasBlockCol = header.indexOf("block") !== -1;
  var hasClfCol = header.indexOf("clf") !== -1;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row) continue;

    var block = "", clfName = "", intervention = "", brief = "", image = "";

    if (hasBlockCol && hasClfCol) {
      block = (row[1] || "").toString().trim();
      clfName = (row[2] || "").toString().trim();
      intervention = (row[3] || "").toString().trim();
      brief = (row[4] || "").toString().trim();
      image = (row[5] || "").toString().trim();
    } else {
      intervention = (row[1] || "").toString().trim();
      brief = (row[2] || "").toString().trim();
      image = (row[3] || "").toString().trim();
    }

    if (!intervention && !brief) continue;
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
