// 오씨돌 투표 Apps Script v2 (GET 방식 - CORS 문제 해결)
// 1. SHEET_ID를 본인 스프레드시트 ID로 교체하세요
// 2. 배포 > 새 배포 > 웹앱 > 액세스: 모든 사용자

var SHEET_ID   = 'YOUR_SHEET_ID_HERE';
var SHEET_NAME = 'votes';

function initSheet(sheet) {
  if (sheet.getLastRow() < 2) {
    sheet.getRange(1, 1, 1, 2).setValues([['id', 'votes']]);
    var init = [];
    for (var i = 1; i <= 200; i++) init.push([i, 0]);
    sheet.getRange(2, 1, 200, 2).setValues(init);
  }
}

// GET 하나로 읽기 + 투표 모두 처리 (CORS 문제 우회)
function doGet(e) {
  try {
    var ss    = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
    initSheet(sheet);

    // action=vote 이면 투표 처리
    if (e.parameter.action === 'vote') {
      return handleVote(sheet, e.parameter.ids);
    }

    // 기본: 득표 데이터 반환
    return readVotes(sheet);

  } catch (err) {
    return output({ ok: false, error: err.message });
  }
}

function handleVote(sheet, idsParam) {
  var lock = LockService.getScriptLock();
  try {
    lock.tryLock(10000);

    var votedIds = JSON.parse(decodeURIComponent(idsParam || '[]'));
    if (!Array.isArray(votedIds) || votedIds.length === 0) {
      throw new Error('투표 데이터가 없습니다');
    }

    var data    = sheet.getDataRange().getValues();
    var idToRow = {};
    for (var i = 1; i < data.length; i++) {
      idToRow[String(data[i][0])] = i + 1;
    }

    for (var j = 0; j < votedIds.length; j++) {
      var row = idToRow[String(votedIds[j])];
      if (row) {
        var cell = sheet.getRange(row, 2);
        cell.setValue(Number(cell.getValue()) + 1);
      }
    }

    return output({ ok: true });

  } catch (err) {
    return output({ ok: false, error: err.message });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

function readVotes(sheet) {
  var data  = sheet.getDataRange().getValues();
  var votes = {};
  for (var i = 1; i < data.length; i++) {
    votes[String(data[i][0])] = Number(data[i][1]) || 0;
  }
  return output({ ok: true, votes: votes });
}

function output(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
