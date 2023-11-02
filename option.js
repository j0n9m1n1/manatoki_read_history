

document.getElementById('exportData').addEventListener('click', function () {
    chrome.storage.local.get(['titleList'], function (result) {
        var titleList = result.titleList || [];
        var jsonData = JSON.stringify(titleList, null, 2);

        var blob = new Blob([jsonData], { type: 'application/json' });
        var url = URL.createObjectURL(blob);

        var a = document.createElement('a');
        a.href = url;
        a.download = 'exported_data.json';
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
    });
});


// document.getElementById('clearData').addEventListener('click', function () {
//     chrome.storage.local.remove('titleList', function () {
//         linkListElement.innerHTML = '';
//     });
// });

// document.getElementById('uploadButton').addEventListener('click', function () {
//     var fileInput = document.getElementById('fileInput');
//     var file = fileInput.files[0];

//     if (file) {
//         var reader = new FileReader();

//         reader.onload = function (event) {
//             var content = event.target.result;
//             try {
//                 var jsonData = JSON.parse(content);
//                 chrome.storage.local.set({ 'titleList': jsonData }, function () {
//                     alert('데이터가 저장되었습니다.');
//                 });
//             } catch (error) {
//                 alert('올바른 JSON 형식이 아닙니다.');
//             }
//         };

//         reader.readAsText(file);
//     }
// });

// document.getElementById('unregister').addEventListener('click', function () {

//     fetch()
//     var fileInput = document.getElementById('fileInput');
//     var file = fileInput.files[0];

//     if (file) {
//         var reader = new FileReader();

//         reader.onload = function (event) {
//             var content = event.target.result;
//             try {
//                 var jsonData = JSON.parse(content);
//                 chrome.storage.local.set({ 'titleList': jsonData }, function () {
//                     alert('데이터가 저장되었습니다.');
//                 });
//             } catch (error) {
//                 alert('올바른 JSON 형식이 아닙니다.');
//             }
//         };

//         reader.readAsText(file);
//     }
// });
// document.getElementById('password_reset').addEventListener('click', function () {
//     chrome.extension.getBackgroundPage.prompt("qwe")
//     chrome.extension.getBackgroundPage().alert("비밀번호를 초기화 할 이메일 주소를 입력 후 확인을 눌러주세요.");

//     let input_email = chrome.extension.getBackgroundPage().prompt("비밀번호를 초기화 할 이메일 주소를 입력 후 확인을 눌러주세요.");
//     // let input_email = prompt("비밀번호를 초기화 할 이메일 주소를 입력 후 확인을 눌러주세요.");

//     if (input_email !== undefined && input_email !== "" && input_email !== null) {
//         const url = `https://jmlee4dev.net/extension/reset_password`;

//         fetch(url, {
//             method: 'POST',
//             mode: 'cors',
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json'
//             },
//             body: { email: input_email }
//         })
//             .then(response => response.json()) // JSON 형식으로 파싱
//             .then(data => {
//                 var parsed_json = JSON.parse(data);
//                 // var result = data.map(function (history) {
//                 //     return { "title": history.title, "read_at": history.read_at.toString(), "saved": true };
//                 // });
//                 console.log(parsed_json)
//                 sendResponse(parsed_json);
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//             });
//     }
// });
