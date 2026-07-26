// Google Apps Script - Copy this into your Google Sheet's Apps Script editor
// Go to Extensions > Apps Script in your Google Sheet

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var result = {};

  // Basic Details sheet (gid=0)
  var basicSheet = sheet.getSheetByName("Basic Details");
  if (basicSheet) {
    var basicData = basicSheet.getDataRange().getValues();
    result.blocks = parseBasicDetails(basicData);
  }

  // Farm Intervention sheet
  var farmSheet = findSheet(sheet, ["Farm Intervention", "Farm Intervention "]);
  if (farmSheet) {
    var farmData = farmSheet.getDataRange().getValues();
    result.farmInterventions = parseInterventions(farmData);
  } else {
    result.farmInterventions = [];
  }

  // Non Farm Intervention sheet
  var nonFarmSheet = findSheet(sheet, ["Non Farm Intervention", "Non Farm Intervention ", "Non Farm  Intervention"]);
  if (nonFarmSheet) {
    var nonFarmData = nonFarmSheet.getDataRange().getValues();
    result.nonFarmInterventions = parseInterventions(nonFarmData);
  } else {
    result.nonFarmInterventions = [];
  }

  // FI Intervention sheet
  var fiSheet = findSheet(sheet, ["FI Intervention", "FI Intervention ", "FI  Intervention"]);
  if (fiSheet) {
    var fiData = fiSheet.getDataRange().getValues();
    result.fiInterventions = parseInterventions(fiData);
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

  // Get images from all intervention sheets
  result.images = getImages(sheet);

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function findSheet(spreadsheet, names) {
  var sheets = spreadsheet.getSheets();
  for (var n = 0; n < names.length; n++) {
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getName().trim() === names[n].trim()) {
        return sheets[i];
      }
    }
  }
  // Fallback: partial match
  for (var i = 0; i < sheets.length; i++) {
    var sName = sheets[i].getName().trim().toLowerCase();
    for (var n = 0; n < names.length; n++) {
      if (sName.indexOf(names[n].trim().toLowerCase()) !== -1) {
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

    // Filter out total/summary rows
    if (blockLower === "total" ||
        blockLower.indexOf("block") !== -1 && blockLower.match(/\d/) ||
        blockLower.indexOf("as per") !== -1 ||
        blockLower.indexOf("lokos") !== -1 ||
        clfLower === "total" ||
        clfLower.indexOf("-clf") !== -1 ||
        clfLower.indexOf("-vo") !== -1 ||
        clfLower.indexOf("-shg") !== -1) {
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

function parseInterventions(data) {
  var interventions = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var slNo = row[0] ? row[0].toString().trim() : "";
    var name = row[1] ? row[1].toString().trim() : "";
    var brief = row[2] ? row[2].toString().trim() : "";
    var imageLink = row[3] ? row[3].toString().trim() : "";

    if (!name) continue;

    // Skip total/header rows
    var slLower = slNo.toLowerCase();
    var nameLower = name.toLowerCase();
    if (slLower === "total" || nameLower === "total" ||
        nameLower === "name of intervention" || nameLower.indexOf("sl no") !== -1 ||
        nameLower === "brief info on intervention programme") {
      continue;
    }

    var imageUrl = convertDriveLink(imageLink);

    interventions.push({
      slNo: slNo,
      name: name,
      brief: brief,
      image: imageUrl
    });
  }

  return interventions;
}

function convertDriveLink(link) {
  if (!link) return "";

  link = link.toString().trim();

  // Handle Google Drive share links (multiple formats)
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

function getImages(spreadsheet) {
  var images = {};
  var sheetNames = ["Farm Intervention", "Non Farm Intervention", "FI Intervention"];

  sheetNames.forEach(function(sheetName) {
    var s = findSheet(spreadsheet, [sheetName]);
    if (s) {
      var data = s.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        var name = data[i][1] ? data[i][1].toString().trim() : "";
        var imageLink = data[i][3] ? data[i][3].toString().trim() : "";

        if (name && imageLink) {
          images[name] = convertDriveLink(imageLink);
        }
      }
    }
  });

  return images;
}

function testDoGet() {
  var result = doGet({});
  Logger.log(result.getContent());
}
