var token;
var expired = true;
var div_episodes = document.getElementById("div_episodes");
var div_comics = document.getElementById("div_comics");
var div_popularity = document.getElementById("div_popularity");
// chrome.runtime.sendMessage({type: "createNotification"});

chrome.storage.local.get(['email', 'token', 'token_expire'], function (result) {
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
                console.log('토큰이 만료되었습니다.');
                expired = true;
                document.getElementById('div_login').style.display = 'block';
                document.getElementById('div_login_info').style.display = 'none';

            } else {
                console.log(currentTime + " " + expireTime)
                console.log('토큰은 아직 유효합니다.');
                expired = false;
                document.getElementById('div_login').style.display = 'none';
                document.getElementById('div_login_info').style.display = 'show';
                document.getElementById('login_email').textContent = 'email: ' + result.email;

            }
        }
        else {
            console.log('not found token expire.' + expireTimeString)
            document.getElementById('div_login').style.display = 'show';
            document.getElementById('div_login_info').style.display = 'none';

        }
    }
    else {
        console.log('not found token.')
        document.getElementById('div_login_info').style.display = 'none';
    }
});

//여기 봐도 봐도 이해X 비동기+비동기에 아이템이 자꾸 바뀌어서
function removeItem(event) {
    var listItem = event.target.parentElement;
    var itemUUID = listItem.id;

    // console.log("delete itemUUID: " + itemUUID);
    chrome.storage.local.get(['titleList'], function (result) {
        var stored_item = result.titleList || []; // 수정된 부분: result.titleList로 변경
        var updatedList = stored_item.filter(function (item) {
            console.log("delete: " + item.title, item.uuid, item.read_at);
            return item.uuid !== itemUUID; // 수정된 부분: item.title과 itemUUID를 비교
        });

        chrome.storage.local.set({ 'titleList': updatedList }, function () {
            // storage에서 삭제가 완료되면 UI에서도 삭제
            // var target_read_at = listItem.read_at;
            var target_item = stored_item.find(function (item) {
                return item.uuid === itemUUID;
            });
            var target_title = target_item.title;
            listItem.remove();
            console.log("deletedeletedeletedelete: " + target_title);

            chrome.runtime.sendMessage({ action: "delete", title: target_title }, function (response) {
            });
        });
    });
}

var linkListElement = document.getElementById('linkList');
var comicTitlesElement = document.getElementById('comic_title_list');
var popularityTitleElement = document.getElementById('popularity_episode_list');

chrome.storage.local.get(['titleList'], function (result) {
    var titleList = result.titleList || [];

    var groupedByDate = {};
    titleList.forEach(function (item) {
        var date = item.read_at.split(' ')[0]; // 날짜 부분만 추출

        if (!groupedByDate[date]) {
            groupedByDate[date] = [];
        }

        groupedByDate[date].push(item);
    });

    for (var date in groupedByDate) {
        var dateHeader = document.createElement('h2');
        dateHeader.textContent = date;
        linkListElement.appendChild(dateHeader);

        var itemList = groupedByDate[date];
        itemList.forEach(function (item) {
            var button = document.createElement('button');
            button.textContent = 'Delete';
            var listItem = document.createElement('li');
            listItem.id = item.uuid
            listItem.textContent = item.read_at.split(' ')[1] + ' - ' + item.title + ' - ' + item.saved + ' - ';
            button.addEventListener('click', removeItem);

            linkListElement.appendChild(listItem);
            listItem.appendChild(button);

            // console.log(button.parentNode)
            // console.log(button.parentNode.uuid)
            // console.log(button.parentNode.parentNode)
            // console.log(button.parentNode.parentNode.uuid)

        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // document.getElementById('openOption').addEventListener('click', function () {
    //     chrome.tabs.create({ url: 'option.html' });
    // });

    document.getElementById('openRegister').addEventListener('click', function () {
        chrome.tabs.create({ url: 'register.html' });
    });

    document.getElementById('episodes').addEventListener('click', function () {
        div_episodes.style.display = "block"
        div_comics.style.display = "none"
        div_popularity.style.display = "none"
    });

    document.getElementById('comics').addEventListener('click', function () {
        div_episodes.style.display = "none"
        div_comics.style.display = "block"
        div_popularity.style.display = "none"
        // const url = `https://jmlee4dev.net/extension/get_history_of_title?comic_title=${encodeURIComponent(comic_title)}&token=${encodeURIComponent(token)}`;
        const url = `https://jmlee4dev.net/extension/get_comics?token=${encodeURIComponent(token)}`;
        if (!expired) {
            fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            })
                .then(response => response.json()) // JSON 형식으로 파싱
                .then(data => {
                    parsed_json = JSON.parse(data)
                    console.log("get_comic: " + parsed_json)

                    var ulElement = document.getElementById('comic_title_list');

                    while (ulElement.firstChild) {
                        ulElement.removeChild(ulElement.firstChild);
                    }

                    for (var title of parsed_json["comic_title"]) {
                        var listItem = document.createElement('li');
                        console.log(title);
                        listItem.textContent = title;
                        comicTitlesElement.appendChild(listItem);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            return true; // 비동기 처리를 위해 true를 반환
        }
        else {
            console.log('expired token.');
        }
    });

    document.getElementById('popularity').addEventListener('click', function () {
        div_episodes.style.display = "none"
        div_comics.style.display = "none"
        div_popularity.style.display = "block"

        const url = `https://jmlee4dev.net/extension/get_popularity_episode?token=${encodeURIComponent(token)}`;
        if (!expired) {
            fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            })
                .then(response => response.json()) // JSON 형식으로 파싱
                .then(data => {
                    parsed_json = JSON.parse(data);
                    console.log("get_popularity_episode: " + parsed_json);
                    // console.log(get_popularity_episode);
                    var ulElement = document.getElementById('popularity_episode_list');

                    while (ulElement.firstChild) {
                        ulElement.removeChild(ulElement.firstChild);
                    }

                    for (var key in parsed_json) {
                        var listItem = document.createElement('li');
                        console.log(key);
                        listItem.textContent = key + ", " + parsed_json[key];
                        popularityTitleElement.appendChild(listItem);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            return true; // 비동기 처리를 위해 true를 반환
        }
        else {
            console.log('expired token.');
        }
    });
});

document.getElementById('loginButton').addEventListener('click', function () {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    fetch('https://jmlee4dev.net/extension/login', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })
    })
        .then(response => response.json())
        .then(data => {
            data = JSON.parse(data);
            console.log(data.token)
            console.log(data.token_expire)
            console.log("data message: ", data.message)
            if (data.message === "success") {
                chrome.storage.local.set({
                    'email': email,
                    'token': data.token,
                    'token_expire': data.token_expire
                }, function () {

                });
                document.getElementById('login_email').textContent = 'email: ' + email;
                document.getElementById('div_login').style.display = 'none';
                document.getElementById('div_login_info').style.display = 'block';
            }
            else {
                var loginMessage = document.getElementById('loginMessage');
                loginMessage.textContent = '로그인 실패';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

document.getElementById('logout').addEventListener('click', function () {
    // 토큰과 만료 시간 삭제
    chrome.storage.local.remove(['email', 'token', 'token_expire'], function () {
        console.log('로그아웃 완료');
        document.getElementById('login_email').textContent = '';
        document.getElementById('div_login').style.display = 'block';
        document.getElementById('div_login_info').style.display = 'none';


    });
});

document.getElementById('sync').addEventListener('click', function () {
    chrome.storage.local.get(['titleList'], function (result) {
        var titleList = result.titleList || [];
        for (var i = 0; i < titleList.length; i++) {
            if (titleList[i].saved === false) {
                title = titleList[i].title;
                console.log("sync title: " + i + " " + title)
                chrome.runtime.sendMessage({ action: "setTitle", title: title, read_at: "1970-01-01 00:00:01" }, function (response) {
                    console.log(response);
                });
            }
        }
    });
});






