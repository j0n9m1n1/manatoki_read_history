function showFeedbackMessage(message) {
    chrome.runtime.sendMessage({ action: "showMessage", message: message });
}
//comment 개수를 찾아서 지워버리다가 회차수를 지워버릴 수도 있어서, 코멘트 개수의 length만큼 앞 뒤에서 지우도록.
//어떤건 data-index가 순차적인데 어떤건 또 규칙이 다름
function checkReadTitle() {

    var listItems = document.querySelectorAll('.list-item'); // 모든 list-item 엘리먼트를 가져옵니다.

    listItems.forEach(function (listItem) {
        var dataIndexValue = listItem.getAttribute('data-index');
        var wrTitle = listItem.querySelector('.wr-subject a').textContent.trim();
        var countElement = listItem.querySelector('.count.orangered.hidden-xs');
        var commentCountLength = countElement.textContent.length;

        wrTitle = wrTitle.substring(commentCountLength, wrTitle.length - commentCountLength).trim()
        console.log('data-index value: ' + dataIndexValue);
        console.log('commentCount: ' + countElement.textContent)
        console.log('commentCountLength: ' + commentCountLength)
        console.log('clean title: ' + wrTitle)

        chrome.storage.local.get(['titleList'], function (result) {
            var titleList = result.titleList || [];

            for (var i = 0; i < titleList.length; i++) {
                console.log('dataIndexValue: ' + dataIndexValue)
                if (titleList[i].title === wrTitle) {
                    console.log('stored title: ' + titleList[i].title + ', list title: ' + wrTitle + ', found dataIndexValue: ' + dataIndexValue)
                    var timestamp = titleList[i].timestamp;
                    var titleElement = listItem.querySelector('li[data-index="' + dataIndexValue + '"] .wr-subject');
                    var timeElement = document.createElement('span');

                    timeElement.textContent = ' Read - ' + timestamp;
                    titleElement.append(timeElement);
                }
            }
        });
    });
}

    // var itemCount = document.querySelectorAll('.item-subject').length;

    // for (var idx = itemCount; idx > 0; idx--) {
    //     (function (idx) {  // 클로저
    //         var listItemElement = document.querySelector('li.list-item');
    //         var dataIndexValue = listItemElement.getAttribute('data-index');
    //         console.log('data-index value: ' + dataIndexValue);
    //         var wrNum = document.querySelector('li.list-item[data-index="' + dataIndexValue + '"] .wr-num').textContent.trim();
    //         console.log('wrNum: ' + wrNum)
    //         var countElement = document.querySelector('.count.orangered.hidden-xs');
    //         var commentCountLength = countElement.textContent.length;

    //         var listTitle = document.querySelector('#serial-move > div > ul > li:nth-child(' + idx + ') > div.wr-subject > a').textContent.trim();
    //         listTitle = listTitle.substring(commentCountLength, listTitle.length - commentCountLength).trim()

    //         chrome.storage.local.get(['titleList'], function (result) {
    //             var titleList = result.titleList || [];

    //             for (var i = 0; i < titleList.length; i++) {
    //                 console.log('idx: ' + idx)
    //                 if (titleList[i].title === listTitle) {
    //                     console.log('stored title: ' + titleList[i].title + ', list title: ' + listTitle + ', found idx: ' + idx)
    //                     var timestamp = titleList[i].timestamp;
    //                     var titleElement = document.querySelector('li[data-index="' + idx + '"] .wr-subject');
    //                     var timeElement = document.createElement('span');

    //                     timeElement.textContent = ' - ' + timestamp;
    //                     titleElement.append(timeElement);
    //                 }
    //             }
    //         });
    //     })(idx);  // 클로저 호출
    // }

async function processTitle() {
    showFeedbackMessage('saved');
    var titleElement = document.querySelector('.toon-title');

    if (titleElement) {
        var titleValue = titleElement.getAttribute('title');
        if (titleValue) {
            console.log("링크 제목:", titleValue);

            try {
                const response = await new Promise((resolve, reject) => {
                    chrome.runtime.sendMessage({ action: "setTitle", titleValue: titleValue }, function (response) {

                        console.log(response);
                        if (response === null) {
                            reject(new Error('응답이 null입니다.'));
                        } else if (response.success) {
                            resolve(response);
                        } else if (response.fail) {
                            reject(new Error('저장 실패'));
                        }
                    });
                });

                showFeedbackMessage('저장되었습니다.');
                console.log('before noti')
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'done_FILL0_wght400_GRAD0_opsz24.png',
                    title: '알림 제목',
                    message: '알림 내용'
                }, function (notificationId) {
                    console.log('created notification')
                });
            } catch (error) {
                console.error(error);
            }
        } else {
            console.log('제목이 없습니다.');
        }
    } else {
        checkReadTitle();
        console.log('toon-title 클래스를 가진 요소를 찾을 수 없습니다. 아마 전체 목록 페이지?');
    }
}

processTitle();