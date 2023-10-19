chrome.storage.local.get(['token', 'token_expire'], function(result) {
    var token = result.token;
    var expireTimeString = result.token_expire;
    // 만료 시간 문자열을 Date 객체로 변환
    var expireTime = new Date(expireTimeString);

    // 현재 시간을 가져옵니다.
    var currentTime = new Date();

    // 토큰 만료 여부 확인
    if (currentTime > expireTime) {
        console.log('토큰이 만료되었습니다.');
    } else {
        console.log('토큰은 아직 유효합니다.');
    }
});

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
            var listItem = document.createElement('li');
            listItem.textContent = item.timestamp.split(' ')[1] + ' - ' + item.title;
            linkListElement.appendChild(listItem);
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
                'token': data.token, 
                'token_expire': data.token_expire}, function () {

                });
                document.getElementById('div_login').style.display = 'none';
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