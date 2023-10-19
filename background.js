var token;
var expired = true;

chrome.storage.local.get(['token', 'token_expire'], function(result) {
    token = result.token;
    var expireTimeString = result.token_expire;
    // 만료 시간 문자열을 Date 객체로 변환
    var expireTime = new Date(expireTimeString);

    // 현재 시간을 가져옵니다.
    var currentTime = new Date();

    // 토큰 만료 여부 확인
    if (currentTime > expireTime) {
        console.log('토큰이 만료되었습니다.');
        expired = true;
        document.getElementById('div_login').style.display = 'block';
    } else {
        console.log('토큰은 아직 유효합니다.');
        expired = false;
        document.getElementById('div_login').style.display = 'none';
    }
});

if (expired === false)
{

}
else
{

}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "setTitle") {
        var titleValue = request.titleValue;
        var currentFormattedDateTime = getLocalDateTimeString();
        var tokenValue = "TOKENTEST"

        var formData = {
            title: titleValue,
            read_at: currentFormattedDateTime,
            token: tokenValue
          };
        // 데이터를 JSON으로 변환
    var jsonData = JSON.stringify(formData);
    console.log(jsonData)
    // 서버로 데이터 전송
    fetch('https://jmlee4dev.net/extension/add_read_history', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData) // 이 부분을 수정하여 JSON으로 변환
      // body: jsonData
    })
      .then(response => response.json())
      .then(data => {
        console.log('서버 응답:', data);
        // 성공적으로 처리된 경우의 코드
      })
      .catch(error => {
        console.error('에러:', error);
        // 에러 발생 시 처리하는 코드
      });

        chrome.storage.local.get(['titleList'], function (result) {
            var titleList = result.titleList || [];

            // 중복된 타이틀 확인 후 업데이트
            var isDuplicate = false;
            for (var i = 0; i < titleList.length; i++) {
                if (titleList[i].title === titleValue) {
                    titleList[i].timestamp = currentFormattedDateTime;
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                // 중복된 타이틀이 아닌 경우에만 추가
                titleList.unshift({
                    uuid: generateUUID(),
                    title: titleValue,
                    timestamp: currentFormattedDateTime,
                    saved: false // 기본값은 false
                });
                sendResponse({ success: true });

            }

            chrome.storage.local.set({ 'titleList': titleList }, function () {
                // 저장된 목록을 출력
                sendResponse({ success: true });
                // logAllData(titleList);
            });
        });
    }
});

function getLocalDateTimeString() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    var seconds = String(now.getSeconds()).padStart(2, '0');

    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}

function logAllData(data) {
    for (var i = 0; i < data.length; i++) {
        console.log('uuid ' + i + ': ' + data[i].uuid);
        console.log('Title ' + i + ': ' + data[i].title);
        console.log('Timestamp ' + i + ': ' + data[i].timestamp);
        console.log('saved ' + i + ': ' + data[i].saved);
    }
}