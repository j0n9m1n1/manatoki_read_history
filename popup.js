var request_fetch_count = 50

var email = undefined;
var token = undefined;
var expired = true;

var div_episodes = document.getElementById("div_episodes");
var div_comics = document.getElementById("div_comics");
var div_popularity = document.getElementById("div_popularity");

const tabs = document.querySelectorAll('.tab_btn');
const all_content = document.querySelectorAll('.content');

tabs.forEach((tab, index) => {
    tab.addEventListener('click', (e) => {
        tabs.forEach(tab => { tab.classList.remove('active') })
        tab.classList.add('active')

        var line = document.querySelector('.line');
        line.style.width = e.target.offsetWidth + "px";
        line.style.left = e.target.offsetLeft + "px";

        all_content.forEach(content => { content.classList.remove('active') });
        all_content[index].classList.add('active');
    });

})

check_my_token().then(() => {
    console.log('after resolve()')
    // document.addEventListener('DOMContentLoaded', function () {
    var episodeTitleElement = document.getElementById('episode_title_list');
    var comicTitlesElement = document.getElementById('comic_title_list');
    var popularityTitleElement = document.getElementById('popularity_episode_list');

    get_episode_titles(episodeTitleElement, request_fetch_count);

    document.getElementById('register').addEventListener('click', function () {
        chrome.tabs.create({ url: 'register.html' });
    });

    document.getElementById('episodes').addEventListener('click', function () {
        console.log('episodes')
        get_episode_titles(episodeTitleElement, request_fetch_count);

    });

    document.getElementById('comics').addEventListener('click', function () {
        get_comic_titles(comicTitlesElement);
    });

    document.getElementById('popularity').addEventListener('click', function () {
        get_popularity_episode_titles(popularityTitleElement);
    });
    // });

    document.getElementById('loginButton').addEventListener('click', function () {
        login();
    });

    document.getElementById('logout').addEventListener('click', function () {
        logout();
    });

    document.getElementById('unregister').addEventListener('click', function () {
        let userInput = prompt("탈퇴 시 계정과 기록이 삭제됩니다.\n탈퇴를 원하면 패스워드를 입력 후 확인 버튼을 눌러주세요.", "your password");

        if (userInput) {
            unregister(userInput);
        } else {

        }
    });
    document.getElementById('password_reset').addEventListener('click', function () {
        let userInput = prompt("비밀번호를 초기화 할 이메일을 적어주세요.", "example@gmail.com");

        if (userInput) {
            password_reset(userInput);
        } else {

        }
    });

    document.getElementById('password_change').addEventListener('click', function () {
        if (!expired && expired != undefined && token !== "" && token != undefined) {
            chrome.tabs.create({ url: 'password_change.html' });
            // chrome.tabs.create({ url: `password_change.html?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)} `});
        }
        else {
            alert("재 로그인 후 이용해주세요.")
        }
    });

    document.getElementById("password").addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            document.getElementById("loginButton").click();
        }
    });

    // document.getElementById("btn_close_notice").addEventListener("click", function (event) {
    //     document.getElementById('container_notice').style.display = 'none';
    //     document.getElementById('temp_space').style.display = 'none';
    // });
}).catch((error) => {
    console.error(error);
});

function check_my_token() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['email', 'token', 'token_expire'], function (result) {
            token = result.token;
            var expireTimeString = result.token_expire;
            if (result.email != undefined) {
                document.getElementById("email").value = result.email;
            }
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
                        document.getElementById('container').style.display = 'none';

                    } else {
                        console.log(currentTime + " " + expireTime)
                        console.log('토큰은 아직 유효합니다.');
                        expired = false;
                        document.getElementById('div_login').style.display = 'none';
                        document.getElementById('div_login_info').style.display = 'block';
                        document.getElementById('login_email').textContent = 'Email: ' + result.email;
                        document.getElementById('container').style.display = 'block';

                        email = result.email;
                    }
                }
                else {
                    console.log('not found token expire.' + expireTimeString)
                    document.getElementById('div_login').style.display = 'block';
                    document.getElementById('div_login_info').style.display = 'none';
                    document.getElementById('container').style.display = 'none';

                }
            }
            else {
                console.log('not found token.')
                document.getElementById('div_login').style.display = 'block';
                document.getElementById('div_login_info').style.display = 'none';
                document.getElementById('container').style.display = 'none';

            }
            console.log('before resolve()')
            resolve();
        });
    });
}

function login() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    // chrome.runtime.sendMessage({ action: "login", email: email, password: password }, function (response) {
    // });
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
            // data = JSON.parse(data);
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
                get_episode_titles(episodeTitleElement, request_fetch_count);

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
        check_my_token();
        console.log('로그아웃 완료');
    });
}

function unregister(userInput) {
    if (!expired && expired != undefined && token !== "" && token != undefined) {
        fetch('https://jmlee4dev.net/extension/unregister', {
            method: 'DELETE',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password: userInput })
        })
            .then(response => response.json())
            .then(data => {
                logout();
                alert(data.message)
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}
function password_reset(userInput) {

    fetch('https://jmlee4dev.net/extension/reset_password', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: userInput })
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => {
            console.error('Error:', error);
        });

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
            .then(response => response.json())
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
                        // var button = document.createElement('button');
                        // button.textContent = 'Delete';
                        // button.className = 'btn';
                        // button.addEventListener('click', removeItem);
                        var listItem = document.createElement('li');
                        // listItem.textContent = parsed_json[title] + ' - ' + title + '  ';
                        listItem.textContent = parsed_json[title] + ' - ' + title;
                        // listItem.appendChild(button);
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
                if (data.message === "not found today") {

                    while (popularityTitleElement.firstChild) {
                        popularityTitleElement.removeChild(popularityTitleElement.firstChild);
                    }

                    var listItem = document.createElement('li');
                    listItem.textContent = "Not found today"
                    popularityTitleElement.appendChild(listItem);
                }
                else {
                    parsed_json = JSON.parse(data);
                    console.log("get_popularity_episode: " + parsed_json);

                    while (popularityTitleElement.firstChild) {
                        popularityTitleElement.removeChild(popularityTitleElement.firstChild);
                    }

                    for (var key in parsed_json) {
                        var listItem = document.createElement('li');
                        console.log(key);
                        listItem.textContent = key + ", " + parsed_json[key];
                        popularityTitleElement.appendChild(listItem);
                    }
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

// function removeItem(event) {
//     var listItem = event.target.parentElement;
//     listItem.remove();
//     chrome.runtime.sendMessage({ action: "delete", title: target_title }, function (response) {
//     });
// }

// function switch_div(menu_name) {

//     if (menu_name == "episodes") {
//         div_episodes.style.display = "block"
//         div_comics.style.display = "none"
//         div_popularity.style.display = "none"
//     }
//     else if (menu_name == "comics") {
//         div_episodes.style.display = "none"
//         div_comics.style.display = "block"
//         div_popularity.style.display = "none"
//     }
//     else if (menu_name == "popularity") {
//         div_episodes.style.display = "none"
//         div_comics.style.display = "none"
//         div_popularity.style.display = "block"
//     }
// }