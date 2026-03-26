// 오씨돌 투표 Apps Script v2 (GET 방식 - CORS 문제 해결)
// 1. SHEET_ID를 본인 스프레드시트 ID로 교체하세요
// 2. 배포 > 새 배포 > 웹앱 > 액세스: 모든 사용자

var SHEET_ID   = '19UUoMegsFTR3jeAo-dml6DSZEmWsqv6zM6EaiJPGbfk';
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

    // action=cancelVote 이면 투표 취소 처리
    if (e.parameter.action === 'cancelVote') {
      return handleCancelVote(sheet, e.parameter.ids);
    }

    // action=getVotes 또는 action 없음 → 득표 데이터 반환
    if (e.parameter.action === 'getVotes' || !e.parameter.action) {
      return readVotes(sheet);
    }

    // 알 수 없는 action
    return output({ ok: false, error: '알 수 없는 action: ' + e.parameter.action });

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

function handleCancelVote(sheet, idsParam) {
  var lock = LockService.getScriptLock();
  try {
    lock.tryLock(10000);

    var cancelIds = JSON.parse(decodeURIComponent(idsParam || '[]'));
    if (!Array.isArray(cancelIds) || cancelIds.length === 0) {
      throw new Error('취소할 투표 데이터가 없습니다');
    }

    var data    = sheet.getDataRange().getValues();
    var idToRow = {};
    for (var i = 1; i < data.length; i++) {
      idToRow[String(data[i][0])] = i + 1;
    }

    for (var j = 0; j < cancelIds.length; j++) {
      var row = idToRow[String(cancelIds[j])];
      if (row) {
        var cell = sheet.getRange(row, 2);
        var cur  = Number(cell.getValue()) || 0;
        cell.setValue(Math.max(0, cur - 1)); // 0 아래로 안 내려감
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
