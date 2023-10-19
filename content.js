//comment 개수를 찾아서 지워버리다가 회차수를 지워버릴 수도 있어서, 코멘트 개수의 length만큼 앞 뒤에서 지우도록.
//어떤건 data-index가 순차적인데 어떤건 또 규칙이 다름
function appendReadTime() {

    var listItems = document.querySelectorAll('.list-item'); // 모든 list-item 엘리먼트를 가져옵니다.

    listItems.forEach(function (listItem) {
        var dataIndexValue = listItem.getAttribute('data-index');
        var wrTitle = listItem.querySelector('.wr-subject a').textContent.trim();
        var countElement = listItem.querySelector('.count.orangered.hidden-xs');
        var commentCountLength = countElement.textContent.length;

        wrTitle = wrTitle.substring(commentCountLength, wrTitle.length - commentCountLength).trim()
        // console.log('data-index value: ' + dataIndexValue);
        // console.log('commentCount: ' + countElement.textContent)
        // console.log('commentCountLength: ' + commentCountLength)
        // console.log('clean title: ' + wrTitle)

        chrome.storage.local.get(['titleList'], function (result) {
            var titleList = result.titleList || [];

            for (var i = 0; i < titleList.length; i++) {
                // console.log('dataIndexValue: ' + dataIndexValue)
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

async function start() {
    
    //og:type을 찾는다
    //website면 목록 페이지
    //
    //article이면 뷰 페이지
    //둘 다 subject를 가져온다.
    //article은 wr_num도 챙긴다.
    var ogType = document.querySelector('meta[property="og:type"]');
    var subjectValue;
    if (ogType !== null) {
        var ogTypeValue = ogType.getAttribute('content');
        var subjectMeta = document.querySelector('meta[name="subject"]');

        if (subjectMeta !== null) 
        {
            subjectValue = subjectMeta.getAttribute('content');
            console.log('ogTypeValue: ' + ogTypeValue);

            var ogUrl = document.querySelector('meta[property="og:url"]');
            var ogUrlValue = ogUrl.getAttribute('content');

            if (ogTypeValue === "website") 
            {
                console.log("목록 페이지");
                console.log('subject content: ' + subjectValue);
                appendReadTime();
            } 
            //해당 article 페이지에는 제목만은 존재하지 않음, 회차도 붙어 있음
            //- article 페이지에 website에서 사용하는 만화의 id는 있음
            //- id로 request해서 얻어야 할지 아니면 그냥 잘라서 사용할지
            //- 잘라서 사용하기엔 평소 제목 - 회차에서 특별편 같은건 예외가 있어서 고민중
            // 일단 잘라서 사용하고 잘라서 타이틀이 이상하게 저장 돼도
            // 사용자가 수정 요청 할 수 있도록 하면 되겠지, 예외니까 
            else if (ogTypeValue === "article") 
            {
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
        else 
        {
            console.log('subject 메타 태그를 찾을 수 없습니다.');
        }
    }
}

start();
