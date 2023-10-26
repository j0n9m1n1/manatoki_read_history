var email = undefined;
var token = undefined;
var expired = true;

var div_episodes = document.getElementById("div_episodes");
var div_comics = document.getElementById("div_comics");
var div_popularity = document.getElementById("div_popularity");

check_my_token().then(() => {

    document.addEventListener('DOMContentLoaded', function () {
        var episodeTitleElement = document.getElementById('episode_title_list');
        var comicTitlesElement = document.getElementById('comic_title_list');
        var popularityTitleElement = document.getElementById('popularity_episode_list');

        var request_fetch_count = 50
        get_episode_titles(episodeTitleElement, request_fetch_count);

        document.getElementById('register').addEventListener('click', function () {
            chrome.tabs.create({ url: 'register.html' });
        });

        document.getElementById('episodes').addEventListener('click', function () {
            switch_div('episodes');

            get_episode_titles(episodeTitleElement, request_fetch_count);

        });

        document.getElementById('comics').addEventListener('click', function () {
            switch_div('comics');
            get_comic_titles(comicTitlesElement);
        });

        document.getElementById('popularity').addEventListener('click', function () {
            switch_div('popularity');
            get_popularity_episode_titles(popularityTitleElement);
        });
    });

    document.getElementById('loginButton').addEventListener('click', function () {
        login();
    });

    document.getElementById('logout').addEventListener('click', function () {
        logout();
    });

    document.getElementById('unregister').addEventListener('click', function () {
        var answer = confirm("탈퇴 시 계정과 기록이 삭제됩니다.\n탈퇴 할까요?");

        if (answer) {
            unregister();
        } else {

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
                        document.getElementById('div_login').style.display = 'block';
                        document.getElementById('div_login_info').style.display = 'none';

                    } else {
                        console.log(currentTime + " " + expireTime)
                        console.log('토큰은 아직 유효합니다.');
                        expired = false;
                        document.getElementById('div_login').style.display = 'none';
                        document.getElementById('div_login_info').style.display = 'block';
                        document.getElementById('login_email').textContent = 'email: ' + result.email;
                        email = result.email;
                    }
                }
                else {
                    console.log('not found token expire.' + expireTimeString)
                    document.getElementById('div_login').style.display = 'block';
                    document.getElementById('div_login_info').style.display = 'none';

                }
            }
            else {
                console.log('not found token.')
                document.getElementById('div_login').style.display = 'block';
                document.getElementById('div_login_info').style.display = 'none';
            }
            resolve();
        });
    });
}

function login() {
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
                    //check_my_token() 할까 그냥

                });
                check_my_token();
                // document.getElementById('login_email').textContent = 'email: ' + email;
                // document.getElementById('div_login').style.display = 'none';
                // document.getElementById('div_login_info').style.display = 'block';
            }
            else {
                var loginMessage = document.getElementById('loginMessage');
                loginMessage.textContent = '로그인 실패';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function logout() {
    chrome.storage.local.remove(['email', 'token', 'token_expire'], function () {
        check_my_token();
        console.log('로그아웃 완료');
    });
}

function unregister() {
    if (!expired && expired != undefined && token !== "" && token != undefined) {
        fetch('https://jmlee4dev.net/extension/unregister', {
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
                    logout();
                }
                else {
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}

function switch_div(menu_name) {

    if (menu_name == "episodes") {
        div_episodes.style.display = "block"
        div_comics.style.display = "none"
        div_popularity.style.display = "none"
    }
    else if (menu_name == "comics") {
        div_episodes.style.display = "none"
        div_comics.style.display = "block"
        div_popularity.style.display = "none"
    }
    else if (menu_name == "popularity") {
        div_episodes.style.display = "none"
        div_comics.style.display = "none"
        div_popularity.style.display = "block"
    }
}

function get_episode_titles(episodeTitleElement, request_fetch_count) {
    if (!expired && expired != undefined && token !== "" && token != undefined) {
        const url = `https://jmlee4dev.net/extension/get_episode?req_count=${encodeURIComponent(request_fetch_count)}`;
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
                console.log(data)
                let parsed_json = JSON.parse(data)
                console.log("parsed_json: " + parsed_json)
                var ulElement = document.getElementById('episode_title_list');

                while (ulElement.firstChild) {
                    ulElement.removeChild(ulElement.firstChild);
                }

                for (let title in parsed_json) {
                    if (parsed_json.hasOwnProperty(title)) {
                        var button = document.createElement('button');
                        button.textContent = 'Delete';
                        button.addEventListener('click', removeItem);
                        var listItem = document.createElement('li');
                        listItem.textContent = parsed_json[title] + ' - ' + title + ' ';
                        listItem.appendChild(button);

                        console.log('listItem: ' + listItem)
                        episodeTitleElement.appendChild(listItem);
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}
function get_comic_titles(comicTitlesElement) {
    const url = `https://jmlee4dev.net/extension/get_comics`;
    if (!expired && expired != undefined && token !== "" && token != undefined) {
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
}

function get_popularity_episode_titles(popularityTitleElement) {
    const url = `https://jmlee4dev.net/extension/get_popularity_episode`;
    if (!expired && expired != undefined && token !== "" && token != undefined) {
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
}

function removeItem(event) {
    var listItem = event.target.parentElement;
    listItem.remove();
    chrome.runtime.sendMessage({ action: "delete", title: target_title }, function (response) {
    });
}
