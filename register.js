document.getElementById('registerForm').addEventListener('submit_register', function(event) {
    event.preventDefault(); // 기본 제출 동작 방지
  
    var formData = new FormData(this); // 폼 데이터 가져오기
  
    // 서버로 데이터 전송
    fetch('https://jmlee4dev.net/extension/register', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log('서버 응답:', data);
      // 성공적으로 처리된 경우의 코드
    })
    .catch(error => {
      console.error('에러:', error);
      // 에러 발생 시 처리하는 코드
    });
  });