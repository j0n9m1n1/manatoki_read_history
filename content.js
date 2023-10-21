//모든 사람이 목록 페이지를 거쳐서 뷰페이지로 이동하지 않음
//이러나 저러나 크롤링 하면 더 정확해지긴 하는데, 그러고 싶지는 않음
function appendReadTime(comic_title) {

    chrome.storage.local.get(['token', 'token_expire'], async function (result) {
        const token = result.token;
        const expireTimeString = result.token_expire;

        if (token && expireTimeString) {
            const expireTime = new Date(expireTimeString);
            const currentTime = new Date();

            if (currentTime < expireTime) {
                chrome.runtime.sendMessage({ action: "getReadHistoryOfTitle", comic_title: comic_title, token: token }, function (response) {
                    // 서버 응답을 받아 처리합니다.
                    console.log(response);

                    var listItems = document.querySelectorAll('.list-item'); // 모든 list-item 엘리먼트를 가져옵니다.

                    listItems.forEach(function (listItem) {
                        var dataIndexValue = listItem.getAttribute('data-index');
                        var wrTitle = listItem.querySelector('.wr-subject a').textContent.trim();
                        var countElement = listItem.querySelector('.count.orangered.hidden-xs');
                        var commentCountLength = countElement.textContent.length;

                        wrTitle = wrTitle.substring(commentCountLength, wrTitle.length - commentCountLength).trim()
                        for (let i = 0; i < response.length; i++) {
                            let item = response[i];
                            if (item.title === wrTitle) {
                                var titleElement = listItem.querySelector('li[data-index="' + dataIndexValue + '"] .wr-subject');
                                var timeElement = document.createElement('span');

                                timeElement.textContent = ' Read - ' + item.read_at;
                                titleElement.append(timeElement);
                            }
                        }
                    });

                });
            } else {
                console.log('토큰이 만료되었습니다.');
            }
        } else {
            console.log('토큰 또는 만료 시간이 없습니다.');
        }
    });
}

async function start() {

    var ogType = document.querySelector('meta[property="og:type"]');
    var subjectValue;
    if (ogType !== null) {
        var ogTypeValue = ogType.getAttribute('content');
        var subjectMeta = document.querySelector('meta[name="subject"]');

        if (subjectMeta !== null) {
            subjectValue = subjectMeta.getAttribute('content');
            console.log('ogTypeValue: ' + ogTypeValue);

            var ogUrl = document.querySelector('meta[property="og:url"]');
            var ogUrlValue = ogUrl.getAttribute('content');

            if (ogTypeValue === "website") {
                console.log("목록 페이지");
                console.log('subject content: ' + subjectValue);
                appendReadTime(subjectValue);
            }

            else if (ogTypeValue === "article") {
                console.log("뷰 페이지");
                console.log('subject content: ' + subjectValue);

                try {
                    // const response = await new Promise((resolve, reject) => {
                    const response = await new Promise((resolve) => {
                        chrome.runtime.sendMessage({ action: "setTitle", titleValue: subjectValue }, function (response) {
                            // if (response === null) {
                            //     reject(new Error('응답이 null입니다.'));
                            // } else if (response.success) {
                            //     resolve(response);
                            // } else if (response.fail) {
                            //     reject(new Error('저장 실패'));
                            // }
                        });
                    });
                } catch (error) {
                    console.error(error);
                }
            }
        }
        else {
            console.log('subject 메타 태그를 찾을 수 없습니다.');
        }
    }
}

start();
