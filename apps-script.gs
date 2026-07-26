function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allSheets = ss.getSheets();
  var result = {};

  var debugInfo = [];
  for (var d = 0; d < allSheets.length; d++) {
    debugInfo.push(d + ":" + allSheets[d].getName() + "(rows:" + allSheets[d].getLastRow() + ")");
  }
  result.sheets = debugInfo.join(", ");

  var basicSheet = allSheets[0];
  if (basicSheet) {
    result.blocks = parseBasicDetails(basicSheet.getDataRange().getValues());
  } else {
    result.blocks = [];
  }

  result.farmInterventions = allSheets.length > 1 ? parseInterventionsNew(allSheets[1].getDataRange().getValues()) : [];
  result.nonFarmInterventions = allSheets.length > 2 ? parseInterventionsNew(allSheets[2].getDataRange().getValues()) : [];
  result.fiInterventions = allSheets.length > 3 ? parseInterventionsNew(allSheets[3].getDataRange().getValues()) : [];

  result.summary = {
    blocks: result.blocks.length,
    clfs: 0,
    vos: 0,
    shgs: 0
  };

  result.blocks.forEach(function(block) {
    result.summary.clfs += block.clfs.length;
    block.clfs.forEach(function(clf) {
      result.summary.vos += clf.vo;
      result.summary.shgs += clf.shg;
    });
  });

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseBasicDetails(data) {
  var blocks = {};

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var blockName = row[1] ? row[1].toString().trim() : "";
    var clfName = row[3] ? row[3].toString().trim() : "";
    var vo = parseInt(row[4]) || 0;
    var shg = parseInt(row[5]) || 0;

    if (!blockName || !clfName) continue;

    var blockLower = blockName.toLowerCase();
    var clfLower = clfName.toLowerCase();

    if (blockLower === "total" || clfLower === "total") continue;
    if (blockLower.indexOf("block") !== -1 && /\d/.test(blockLower)) continue;
    if (/\d+-clf/.test(clfLower)) continue;

    if (!blocks[blockName]) {
      blocks[blockName] = {
        name: blockName,
        clfs: []
      };
    }

    blocks[blockName].clfs.push({
      name: clfName,
      vo: vo,
      shg: shg
    });
  }

  var blockArray = [];
  for (var key in blocks) {
    if (blocks[key].clfs.length > 0) {
      blockArray.push(blocks[key]);
    }
  }

  return blockArray;
}

function parseInterventionsNew(data) {
  if (!data || data.length < 2) return [];

  var interventions = [];
  var headerRow = data[0];
  var headerStr = headerRow.join(" ").toLowerCase();
  var isNewFormat = headerStr.indexOf("block") !== -1 && headerStr.indexOf("clf") !== -1;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row) continue;

    var block = "";
    var clfName = "";
    var interventionName = "";
    var brief = "";
    var imageLink = "";

    if (isNewFormat) {
      block = row[1] ? row[1].toString().trim() : "";
      clfName = row[2] ? row[2].toString().trim() : "";
      interventionName = row[3] ? row[3].toString().trim() : "";
      brief = row[4] ? row[4].toString().trim() : "";
      imageLink = row[5] ? row[5].toString().trim() : "";
    } else {
      interventionName = row[1] ? row[1].toString().trim() : "";
      brief = row[2] ? row[2].toString().trim() : "";
      imageLink = row[3] ? row[3].toString().trim() : "";
    }

    if (!block && !clfName && !interventionName) continue;
    if (block.toLowerCase() === "total" || clfName.toLowerCase() === "total") continue;
    if (/\d+-block/i.test(block)) continue;

    interventions.push({
      block: block,
      clfName: clfName,
      name: interventionName,
      brief: brief,
      image: convertDriveLink(imageLink)
    });
  }

  return interventions;
}

function convertDriveLink(link) {
  if (!link) return "";

  link = link.toString().trim();

  var patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/view\?id=([a-zA-Z0-9_-]+)/
  ];

  for (var i = 0; i < patterns.length; i++) {
    var match = link.match(patterns[i]);
    if (match) {
      return "https://drive.google.com/uc?export=view&id=" + match[1];
    }
  }

  return link;
}
