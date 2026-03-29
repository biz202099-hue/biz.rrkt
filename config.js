// =====================================================
//  config.js — 민감한 주소 모음
//  ⚠️  이 파일은 공유하지 마세요
// =====================================================

var CONFIG = {

  // --------------------------------------------------
  //  Google Apps Script API (시트 탭 전체 공통)
  //
  //  연결된 시트 탭:
  //    - votes       : 인기 투표 득표수
  //    - characters  : 캐릭터 기본 정보
  //    - APPEARANCES : 등장 기록 아카이브
  //
  //  사용법 예시:
  //    fetch(API + '?action=getCharacters')
  //    fetch(API + '?action=getAppearances&code=BIZOC2026001')
  //    fetch(API + '?action=like&code=BIZOC2026001')
  //    fetch(API + '?action=getVotes')
  //    fetch(API + '?action=vote&ids=[1,2,3]')
  //    fetch(API + '?action=cancelVote&ids=[1,2,3]')
  // --------------------------------------------------
  API: 'https://script.google.com/macros/s/AKfycbyQ9DiU6MuIZQGue3o12fEKd38HBTFVvSn1KVDpz7Nsqzu7KJDzQCBeRJGZ3vHRwZMg0Q/exec',

  // --------------------------------------------------
  //  Gemini API 키 (Google AI Studio — 무료)
  //  aistudio.google.com → Get API Key → 복사 후 붙여넣기
  // --------------------------------------------------
  GEMINI_KEY: 'AIzaSyDmhgAnxRq_wij8Z4RxOOxldg2rgKem6R8',

};

// =====================================================
//  단축 변수 (HTML에서 API 바로 사용 가능)
// =====================================================
var API      = CONFIG.API;
var VOTE_URL = CONFIG.API; // vote.html 기존 코드 호환용
var GEMINI_KEY  = CONFIG.GEMINI_KEY; // 챗봇용
