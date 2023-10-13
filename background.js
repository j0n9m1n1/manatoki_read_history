chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "setTitle") {
        var titleValue = request.titleValue;
        var currentFormattedDateTime = getLocalDateTimeString();

        chrome.storage.local.get(['titleList'], function (result) {
            var titleList = result.titleList || [];

            // 중복된 타이틀 확인 후 업데이트
            var isDuplicate = false;
            for (var i = 0; i < titleList.length; i++) {
                if (titleList[i].title === titleValue) {
                    titleList[i].timestamp = currentFormattedDateTime;
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                // 중복된 타이틀이 아닌 경우에만 추가
                titleList.unshift({
                    title: titleValue,
                    timestamp: currentFormattedDateTime
                });
                sendResponse({ success: true });

            }

            chrome.storage.local.set({ 'titleList': titleList }, function () {
                // 저장된 목록을 출력
                sendResponse({ success: true });
                logAllData(titleList);
            });
        });
    }
});

function getLocalDateTimeString() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    var seconds = String(now.getSeconds()).padStart(2, '0');

    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}

function logAllData(data) {
    for (var i = 0; i < data.length; i++) {
        console.log('Title ' + i + ': ' + data[i].title);
        console.log('Timestamp ' + i + ': ' + data[i].timestamp);
    }
}