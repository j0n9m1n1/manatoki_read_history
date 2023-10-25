
var token;
var expired = true;
var saved_server = false;

// chrome.runtime.onMessage.addListener((message) => {
//     console.log('notification')
//     if (message.type === "createNotification") {
//       chrome.notifications.create({
//         type: "basic",
//         iconUrl: "saved.png",
//         title: "알림 제목",
//         message: "알림 내용"
//       });
//     }
//   });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "setTitle") {

        chrome.storage.local.get(['token', 'token_expire'], function (result) {
            token = result.token;
            var expireTimeString = result.token_expire;
            console.log("result.token_expire: " + result.token_expire)
            // 만료 시간 문자열을 Date 객체로 변환
            if (token !== null && token !== undefined) {
                if (expireTimeString !== null && expireTimeString !== undefined) {
                    var expireTime = new Date(expireTimeString);

                    // 현재 시간을 가져옵니다.
                    var currentTime = new Date();

                    // 토큰 만료 여부 확인
                    if (currentTime > expireTime) {
                        console.log(currentTime + " " + expireTime)
                        console.log('토큰이 만료 되었습니다.');
                        expired = true;
                    } else {
                        console.log(currentTime + " " + expireTime)
                        console.log('토큰은 아직 유효합니다.');
                        expired = false;
                        console.log("read_at: " + request.read_at)
                        var titleValue = request.title;
                        console.log("bg.js title: " + titleValue)
                        // var currentFormattedDateTime = getLocalDateTimeString();
                        var currentFormattedDateTime = request.read_at;
                        console.log("currentFormattedDateTime: " + currentFormattedDateTime)
                        var formData = {
                            title: titleValue,
                            read_at: currentFormattedDateTime,
                        };
                        var jsonData = JSON.stringify(formData);
                        console.log("add_history: " + jsonData)
                        uuid = generateUUID()
                        fetch('https://jmlee4dev.net/extension/add_read_history', {
                            method: 'POST',
                            mode: 'cors',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            // body: JSON.stringify(formData) // 이 부분을 수정하여 JSON으로 변환
                            body: jsonData
                        })
                            .then(response => response.json())
                            .then(data => {
                                console.log("data.message: " + data.message)
                                if (data.message === "success") {
                                    saved_server = true;
                                }
                                else if (data.message === "fail") {
                                    saved_server = false;
                                }

                                chrome.storage.local.get(['titleList'], function (result) {
                                    var titleList = result.titleList || [];

                                    // 중복된 타이틀 확인 후 업데이트
                                    var isDuplicate = false;
                                    for (var i = 0; i < titleList.length; i++) {
                                        if (titleList[i].title === titleValue) {
                                            titleList[i].read_at = currentFormattedDateTime;
                                            if (saved_server) {
                                                titleList[i].saved = saved_server
                                            }
                                            isDuplicate = true;
                                            break;
                                        }
                                    }

                                    if (!isDuplicate) {
                                        // 중복된 타이틀이 아닌 경우에만 추가
                                        titleList.unshift({
                                            uuid: uuid,
                                            title: titleValue,
                                            read_at: currentFormattedDateTime,
                                            saved: saved_server // 기본값은 false
                                        });
                                        sendResponse({ success: true });

                                    }

                                    chrome.storage.local.set({ 'titleList': titleList }, function () {
                                        // 저장된 목록을 출력
                                        sendResponse({ success: true });
                                        // logAllData(titleList);
                                    });
                                });
                                // data = JSON.parse(data);
                                // 성공적으로 처리된 경우의 코드
                            })
                            .catch(error => {
                                console.error('에러:', error);
                                saved_server = false;

                                chrome.storage.local.get(['titleList'], function (result) {
                                    var titleList = result.titleList || [];

                                    var isDuplicate = false;
                                    for (var i = 0; i < titleList.length; i++) {
                                        if (titleList[i].title === titleValue) {
                                            titleList[i].read_at = currentFormattedDateTime;
                                            isDuplicate = true;
                                            break;
                                        }
                                    }

                                    if (!isDuplicate) {
                                        titleList.unshift({
                                            uuid: uuid,
                                            title: titleValue,
                                            read_at: currentFormattedDateTime,
                                            saved: saved_server
                                        });
                                    }

                                    chrome.storage.local.set({ 'titleList': titleList }, function () {
                                        sendResponse({ success: true });
                                    });
                                });
                            });
                    }
                }
                else {
                    console.log('not found token expire.' + expireTimeString)
                }
            }
            else {
                console.log('not found token.')
            }
        });

        if (expired === true) {
            console.log('토큰이 만료돼서 다시 로그인 해주세요.')
        }
        else {

        }
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "getReadHistoryOfTitle") {
        const { comic_title, token } = request;

        // 이제 comic_title과 token을 사용하여 서버에 요청할 수 있습니다.
        const url = `https://jmlee4dev.net/extension/get_history_of_title?comic_title=${encodeURIComponent(comic_title)}`;

        fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        })
            .then(response => response.json()) // JSON 형식으로 파싱
            .then(data => {
                var result = data.map(function (history) {
                    return { "title": history.title, "read_at": history.read_at.toString(), "saved": true };
                });
                console.log(result)
                sendResponse(result);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        return true; // 비동기 처리를 위해 true를 반환
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "delete") {
        chrome.storage.local.get(['token', 'token_expire'], function (result) {
            token = result.token;
            var expireTimeString = result.token_expire;
            console.log("result.token_expire: " + result.token_expire)
            // 만료 시간 문자열을 Date 객체로 변환
            if (token !== null && token !== undefined) {
                if (expireTimeString !== null && expireTimeString !== undefined) {
                    var expireTime = new Date(expireTimeString);

                    // 현재 시간을 가져옵니다.
                    var currentTime = new Date();

                    // 토큰 만료 여부 확인
                    if (currentTime > expireTime) {
                        console.log(currentTime + " " + expireTime)
                        console.log('토큰이 만료 되었습니다.');
                        expired = true;
                    } else {
                        console.log(currentTime + " " + expireTime)
                        console.log('토큰은 아직 유효합니다.');

                        var formData = {
                            title: request.title,
                        };
                        var jsonData = JSON.stringify(formData);
                        console.log("jsonData: " + jsonData)

                        generateUUID()

                        fetch('https://jmlee4dev.net/extension/delete_history', {
                            method: 'DELETE',
                            mode: 'cors',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            // body: JSON.stringify(formData)
                            body: jsonData
                        })
                            .then(response => response.json())
                            .then(data => {
                                console.log('Success:', data);
                            })
                            .catch((error) => {
                                console.error('Error:', error);
                            });
                    }
                }
            }
        });
    }

});


function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

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
        console.log('Timestamp ' + i + ': ' + data[i].read_at);
        console.log('saved ' + i + ': ' + data[i].saved);
    }
}