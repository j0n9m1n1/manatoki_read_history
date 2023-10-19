chrome.storage.local.get(['token, token_expire'], function(result) {
    var token = result.token;
    var token_expire = result.expire;
    console.log('토큰:', token);
    console.log('토큰:', token_expire);
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
            console.log(data.token)
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