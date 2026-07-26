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
  var farmSheet = sheet.getSheetByName("Farm Intervention");
  if (farmSheet) {
    var farmData = farmSheet.getDataRange().getValues();
    result.farmInterventions = parseInterventions(farmData);
  }

  // Non Farm Intervention sheet
  var nonFarmSheet = sheet.getSheetByName("Non Farm Intervention");
  if (nonFarmSheet) {
    var nonFarmData = nonFarmSheet.getDataRange().getValues();
    result.nonFarmInterventions = parseInterventions(nonFarmData);
  }

  // FI Intervention sheet
  var fiSheet = sheet.getSheetByName("FI Intervention");
  if (fiSheet) {
    var fiData = fiSheet.getDataRange().getValues();
    result.fiInterventions = parseInterventions(fiData);
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

  // Get images from Farm Intervention sheet (column D has image links)
  result.images = getImages(sheet);

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseBasicDetails(data) {
  var blocks = {};
  var headers = data[0];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var blockName = row[1] ? row[1].toString().trim() : "";
    var clfName = row[3] ? row[3].toString().trim() : "";
    var vo = parseInt(row[4]) || 0;
    var shg = parseInt(row[5]) || 0;

    if (!blockName || !clfName || blockName === "Total" || blockName.indexOf("AS PER") !== -1) {
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
    blockArray.push(blocks[key]);
  }

  return blockArray;
}

function parseInterventions(data) {
  var interventions = [];
  var headers = data[0];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var slNo = row[0] ? row[0].toString().trim() : "";
    var name = row[1] ? row[1].toString().trim() : "";
    var brief = row[2] ? row[2].toString().trim() : "";
    var imageLink = row[3] ? row[3].toString().trim() : "";

    if (!slNo || !name || slNo === "Total") {
      continue;
    }

    // Convert Google Drive links to direct image URLs
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

  // Handle Google Drive share links
  var driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  var match = link.match(driveRegex);

  if (match) {
    var fileId = match[1];
    return "https://drive.google.com/uc?export=view&id=" + fileId;
  }

  // Handle direct image URLs
  if (link.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
    return link;
  }

  return link;
}

function getImages(sheet) {
  var images = {};
  var sheets = ["Farm Intervention", "Non Farm Intervention", "FI Intervention"];

  sheets.forEach(function(sheetName) {
    var s = sheet.getSheetByName(sheetName);
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

// Test function - run this first to verify it works
function testDoGet() {
  var result = doGet({});
  Logger.log(result.getContent());
}
