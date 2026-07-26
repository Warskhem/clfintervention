// Google Apps Script - Copy this into your Google Sheet's Apps Script editor
// Go to Extensions > Apps Script in your Google Sheet

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var result = {};
  var allSheets = sheet.getSheets();

  // Log sheet names for debugging
  var sheetNames = [];
  for (var s = 0; s < allSheets.length; s++) {
    sheetNames.push(s + ": " + allSheets[s].getName());
  }
  result.sheetNames = sheetNames;

  // Basic Details sheet - try name match, fallback to index 0
  var basicSheet = findSheet(sheet, ["Basic Details", "basic", "detail"]) || allSheets[0];
  if (basicSheet) {
    var basicData = basicSheet.getDataRange().getValues();
    result.blocks = parseBasicDetails(basicData);
  } else {
    result.blocks = [];
  }

  // Farm Intervention sheet
  var farmSheet = findSheet(sheet, ["Farm Intervention", "farm intervention", "farm"]) || allSheets[1];
  if (farmSheet) {
    var farmData = farmSheet.getDataRange().getValues();
    result.farmInterventions = parseInterventionsNew(farmData);
  } else {
    result.farmInterventions = [];
  }

  // Non Farm Intervention sheet
  var nonFarmSheet = findSheet(sheet, ["Non Farm Intervention", "nonfarm", "non farm", "non-farm"]) || allSheets[2];
  if (nonFarmSheet) {
    var nonFarmData = nonFarmSheet.getDataRange().getValues();
    result.nonFarmInterventions = parseInterventionsNew(nonFarmData);
  } else {
    result.nonFarmInterventions = [];
  }

  // FI Intervention sheet
  var fiSheet = findSheet(sheet, ["FI Intervention", "fi intervention", "fi"]) || allSheets[3];
  if (fiSheet) {
    var fiData = fiSheet.getDataRange().getValues();
    result.fiInterventions = parseInterventionsNew(fiData);
  } else {
    result.fiInterventions = [];
  }

  // Calculate summary
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

function findSheet(spreadsheet, names) {
  var sheets = spreadsheet.getSheets();
  for (var n = 0; n < names.length; n++) {
    var search = names[n].toLowerCase().trim();
    for (var i = 0; i < sheets.length; i++) {
      var sheetName = sheets[i].getName().toLowerCase().trim();
      if (sheetName.indexOf(search) !== -1) {
        return sheets[i];
      }
    }
  }
  return null;
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

    if (blockLower === "total" || clfLower === "total" ||
        blockLower.indexOf("block") !== -1 && blockLower.match(/\d/) ||
        clfLower.indexOf("-clf") !== -1) {
      continue;
    }

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

// New function for updated sheet structure:
// Col A: SL NO, Col B: Block, Col C: CLF Name, Col D: Name of Intervention, Col E: Brief info, Col F: Image Link
function parseInterventionsNew(data) {
  if (!data || data.length < 2) return [];

  var interventions = [];
  var headerRow = data[0];

  // Detect if this is the new format (has Block and CLF Name columns)
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
      // New format: SL NO, Block, CLF Name, Name of Intervention, Brief info, Image Link
      block = row[1] ? row[1].toString().trim() : "";
      clfName = row[2] ? row[2].toString().trim() : "";
      interventionName = row[3] ? row[3].toString().trim() : "";
      brief = row[4] ? row[4].toString().trim() : "";
      imageLink = row[5] ? row[5].toString().trim() : "";
    } else {
      // Old format: SL NO, Name of Intervention, Brief info, Image Link
      interventionName = row[1] ? row[1].toString().trim() : "";
      brief = row[2] ? row[2].toString().trim() : "";
      imageLink = row[3] ? row[3].toString().trim() : "";
    }

    // Skip empty rows and summary rows
    if (!interventionName && !brief) continue;
    if (block.toLowerCase() === "total" || clfName.toLowerCase() === "total") continue;
    if (block.indexOf("BLOCK") !== -1 && block.match(/\d/)) continue;
    if (clfName.indexOf("CLF") !== -1 && clfName.match(/\d/) && !interventionName) continue;

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
