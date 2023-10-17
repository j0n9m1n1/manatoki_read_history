
document.getElementById('clearData').addEventListener('click', function () {
    chrome.storage.local.remove('titleList', function () {
        linkListElement.innerHTML = '';
    });
});

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

document.getElementById('uploadButton').addEventListener('click', function () {
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];

    if (file) {
        var reader = new FileReader();

        reader.onload = function (event) {
            var content = event.target.result;
            try {
                var jsonData = JSON.parse(content);
                chrome.storage.local.set({ 'titleList': jsonData }, function () {
                    alert('데이터가 저장되었습니다.');
                });
            } catch (error) {
                alert('올바른 JSON 형식이 아닙니다.');
            }
        };

        reader.readAsText(file);
    }
});