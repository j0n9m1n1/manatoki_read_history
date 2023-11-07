
var token = undefined;
var expired = true;
var saved_server = false;

check_my_token().then(() => {

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action == "login") {
            bg_login(request, function (res) {
                console.log(res);
                sendResponse(res);
            });
        }
        else if (request.action == "password_reset") {
            bg_password_reset(request, function (res) {
                console.log(res)
                sendResponse(res);
            });

        }

        if (!expired) {
            if (request.action == "logout") {
                bg_logout(request);
            }
            else if (request.action == "unreigster") {
                bg_unregister(request, function (res) {

                    console.log(res);
                    sendResponse(res);
                });

            }
            else if (request.action == "add_history") {
                bg_set_title(request, function (res) {
                    console.log(res)
                    sendResponse(res);
                });

            }
            else if (request.action === "get_history_of_title") {
                bg_get_history_of_title(request, function (res) {
                    console.log(res)
                    sendResponse(res);
                });

            }
            else if (request.action == "get_episode") {
                bg_get_episode(request);
            }
            else if (request.action == "get_comic") {
                bg_get_comic(request);
            }
            else if (request.action == "get_popularity") {
                bg_get_popularity(request);
            }
            else if (request.action == "delete") {
                bg_delete(request);
            }
        }
        else {
            sendResponse("fail");
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
            console.log("result.email: " + result.email)
            console.log("result.token: " + result.token)
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

function bg_login(request, callback) {
    fetch('https://jmlee4dev.net/extension/login', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: request.email, password: request.password })
    })
        .then(response => response.json())
        .then(data => {
            // data = JSON.parse(data);
            console.log(data.token)
            console.log(data.token_expire)
            console.log("data message: ", data.message)
            if (data.message === "success") {
                chrome.storage.local.set({
                    'email': request.email,
                    'token': data.token,
                    'token_expire': data.token_expire
                }, function () {
                    callback("success");
                });


                // document.getElementById('login_email').textContent = 'email: ' + email;
                // document.getElementById('div_login').style.display = 'none';
                // document.getElementById('div_login_info').style.display = 'block';
            }
            else {
                // var loginMessage = document.getElementById('loginMessage');
                // loginMessage.textContent = '로그인 실패';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
function bg_delete(request) {
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

function bg_get_history_of_title(request, callback) {
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
            if (data.message === "not found episodes") {
                callback(data.message);
            }
            else {
                var parsed_json = JSON.parse(data);
                // var result = data.map(function (history) {
                //     return { "title": history.title, "read_at": history.read_at.toString(), "saved": true };
                // });
                console.log("get_history_of_title: " + parsed_json)
                callback(parsed_json);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            callback("error");
        });
    return true; // 비동기 처리를 위해 true를 반환
}

function bg_set_title(request, callback) {
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
                callback(currentFormattedDateTime);
            }
            else if (data.message === "fail") {
                callback("fail");
            }

        })
        .catch(error => {
            console.error('에러:', error);
            callback("error");
        });
}

function bg_logout(request) {
    chrome.storage.local.remove(['token', 'token_expire'], function () {
        fetch('https://jmlee4dev.net/extension/logout', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === "success") {
                }
                else {
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        console.log('로그아웃 완료');
    });
}

function bg_unregister(reuqest, callback) {
    fetch('https://jmlee4dev.net/extension/unregister', {
        method: 'DELETE',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: request.userInput })
    })
        .then(response => response.json())
        .then(data => {
            callback("success");
        })
        .catch(error => {
            console.error('Error:', error);
            callback("error");
        });
}

function bg_password_reset(request, callback) {
    fetch('https://jmlee4dev.net/extension/reset_password', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: request.userInput })
    })
        .then(response => response.json())
        .then(data => {
            callback(data);
        })
        .catch(error => {
            console.error('Error:', error);
            callback(error);
        });
}


function bg_get_episode(request) {

}
function bg_get_comic(request) {

}
function bg_get_popularity(request) {

}