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

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('openOption').addEventListener('click', function() {
      chrome.tabs.create({url: 'option.html'});
    });
  
    document.getElementById('openRegister').addEventListener('click', function() {
      chrome.tabs.create({url: 'register.html'});
    });
  });

  document.getElementById('loginButton').addEventListener('click', function() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    fetch('https://jmlee4dev.net/extension/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => response.text())
    .then(data => {
        console.log('Response:', data);
        alert(data)
        if(data === 'success')
        {
            document.getElementById('username').style.display = 'none';
            document.getElementById('password').style.display = 'none';
            document.getElementById('loginButton').style.display = 'none';
        }
        else
        {
            var loginMessage = document.getElementById('loginMessage');
            loginMessage.textContent = '로그인 실패';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});