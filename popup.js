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

if (expired === false) {

}
else {

}

function removeItem(event) {
    var listItem = event.target.parentElement;
    console.log("delete listItem: " + listItem)
    var itemTitle = listItem.title; // 각 항목의 ID 가져오기
    console.log("delete itemTitle: " + itemTitle)

    // storage에서도 해당 아이템 삭제
    chrome.storage.local.get(['titleList'], function (result) {
        var titleList = result.titleList || [];
        var updatedList = titleList.filter(function (item) {
            console.log("delete: " + itemTitle)
            return item.title !== itemTitle;
        });

        chrome.storage.local.set({ 'titleList': updatedList }, function () {
            // storage에서 삭제가 완료되면 UI에서도 삭제
            read_at = listItem.dataset.read_at
            listItem.remove();
            console.log("delete: " + itemTitle + ", " + read_at)
            chrome.runtime.sendMessage({ action: "delete", itemTitle: itemTitle, read_at: read_at }, function (response) {

            });
        });
    });
}

var linkListElement = document.getElementById('linkList');

chrome.storage.local.get(['titleList'], function (result) {
    var titleList = result.titleList || [];

    var groupedByDate = {};
    titleList.forEach(function (item) {
        var date = item.timestamp.split(' ')[0]; // 날짜 부분만 추출

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
            listItem.textContent = item.timestamp.split(' ')[1] + ' - ' + item.title + ' - ' + item.saved + ' - ';
            button.addEventListener('click', removeItem);

            linkListElement.appendChild(listItem);
            listItem.appendChild(button);

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
    });

    document.getElementById('popularity').addEventListener('click', function () {
        div_episodes.style.display = "none"
        div_comics.style.display = "none"
        div_popularity.style.display = "block"
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






