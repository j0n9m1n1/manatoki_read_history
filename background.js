
var token = undefined;
var expired = true;
var saved_server = false;

// check_my_token();

check_my_token().then(() => {

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

        if (!expired) {
            if (request.action == "setTitle") {
                var titleValue = request.title;
                console.log("read_at: " + request.read_at)
                console.log("bg.js title: " + titleValue)
                var currentFormattedDateTime = request.read_at;
                console.log("currentFormattedDateTime: " + currentFormattedDateTime)
                var formData = {
                    title: titleValue,
                    read_at: currentFormattedDateTime,
                };
                var jsonData = JSON.stringify(formData);
                console.log("add_history: " + jsonData)
                fetch('https://jmlee4dev.net/extension/add_read_history', {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
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

                    })
                    .catch(error => {
                        console.error('에러:', error);
                        saved_server = false;

                    });
            }
            else if (request.action === "getReadHistoryOfTitle") {
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
                        // var result = data.map(function (history) {
                        //     return { "title": history.title, "read_at": history.read_at.toString(), "saved": true };
                        // });
                        console.log(data)
                        sendResponse(data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                return true; // 비동기 처리를 위해 true를 반환
            }
            else if (request.action == "delete") {
                var formData = {
                    title: request.title,
                };

                var jsonData = JSON.stringify(formData);
                console.log("jsonData: " + jsonData)

                fetch('https://jmlee4dev.net/extension/delete_history', {
                    method: 'DELETE',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
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
        else {
            console.log('토큰이 만료돼서 다시 로그인 해주세요.')
        }
    });
}).catch((error) => {
    console.error(error);
});
function check_my_token() {
    return new Promise((resolve, reject) => {

        chrome.storage.local.get(['email', 'token', 'token_expire'], function (result) {
            token = result.token;
            var expireTimeString = result.token_expire;
            console.log("result.token_expire: " + result.token_expire)
            // 만료 시간 문자열을 Date 객체로 변환
            if (token !== "" && token !== undefined) {
                if (expireTimeString !== "" && expireTimeString !== undefined) {
                    var expireTime = new Date(expireTimeString);
                    var currentTime = new Date();

                    // 토큰 만료 여부 확인
                    if (currentTime > expireTime) {
                        console.log(currentTime + " " + expireTime)
                        console.log('토큰이 만료되었습니다.');
                        expired = true;
                    } else {
                        console.log(currentTime + " " + expireTime)
                        console.log('토큰은 아직 유효합니다.');
                        expired = false;
                    }
                }
                else {
                    console.log('not found token expire.' + expireTimeString)
                }
            }
            else {
                console.log('not found token.')
            }
            resolve();
        });

    });
}

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
