var token = null
var expired = null
var email = null
// var urlParams = new URLSearchParams(window.location.search);

// var email = urlParams.get('email');
// var token = urlParams.get('token');

// console.log(`email: ${email}`)
// console.log(`token: ${token}`)
check_my_token().then(() => {
	document.getElementById('changePasswordForm').addEventListener('submit', function (event) {
		event.preventDefault(); // 기본 제출 동작 방지

        console.log(`token: ${token}`)
        console.log(`email: ${email}`)

        password_current = document.getElementById('password_current').value;
        password_new = document.getElementById('password_new').value;
        password_new_confirm = document.getElementById('password_new_confirm').value;

        if (!expired && expired != undefined && token !== "" && token != undefined)
        {
            if (password_new === password_new_confirm) {
                if(password_current !== password_new && 
                    password_current !== password_new_confirm){

                    var formData = {
                        email: email,
                        password_current: document.getElementById('password_current').value,
                        password_new: document.getElementById('password_new').value,
                        password_new_confirm: document.getElementById('password_new_confirm').value
                    };

                    // 데이터를 JSON으로 변환
                    var jsonData = JSON.stringify(formData);
                    console.log(jsonData)
                    // 서버로 데이터 전송
                    fetch('https://jmlee4dev.net/extension/change_password', {
                        method: 'POST',
                        mode: 'cors',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(formData) // 이 부분을 수정하여 JSON으로 변환
                    })
                        .then(response => response.json())
                        .then(data => {
                            logout()
                            alert(data.message)
                        })
                        .catch(error => {
                            alert(data.message)
                        });
                }
                else {
                    alert("현재 비밀번호와 동일합니다.")
                }
    }
    else{
                    alert("입력한 패스워드가 다름")
                    //current와 new가 같음
    }
    }
    else{
        alert("페이지를 닫고 다시 들어와주세요.")
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
                            email = result.email;
                        }
                    }
                    else {
                        console.log('not found token expire.' + expireTimeString)
    
                    }
                }
                else {
                    console.log('not found token.')
                }
                console.log('before resolve()')
                resolve();
            });
        });
    }

    function logout() {

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
            
        chrome.storage.local.remove(['token', 'token_expire'], function () {
            
        });
    }