document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('registerForm').addEventListener('submit', function (event) {
		event.preventDefault(); // 기본 제출 동작 방지

		email = document.getElementById('email').value;
		password = document.getElementById('password').value;
		password_confirm = document.getElementById('password_confirm').value;

		if (password === password_confirm) {
			var formData = {
				email: document.getElementById('email').value,
				password: document.getElementById('password').value,
				password_confirm: document.getElementById('password_confirm')
			};

			// 데이터를 JSON으로 변환
			var jsonData = JSON.stringify(formData);
			console.log(jsonData)
			// 서버로 데이터 전송
			fetch('https://jmlee4dev.net/extension/register', {
				method: 'POST',
				mode: 'cors',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData) // 이 부분을 수정하여 JSON으로 변환
				// body: jsonData
			})
				.then(response => response.json())
				.then(data => {
					alert(data.message)
					console.log('서버 응답:', data);
					// 성공적으로 처리된 경우의 코드
				})
				.catch(error => {
					alert(data.message)
					console.error('에러:', error);
					// 에러 발생 시 처리하는 코드
				});
		}
		else {
			alert("입력한 패스워드가 다름")
		}
	});
});