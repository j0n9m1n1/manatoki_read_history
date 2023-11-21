# Manatoki Read History for Chrome extension
https://chromewebstore.google.com/detail/manatoki-read-history/lgcoegeagamfdggckaioijflokpckeel?hl=ko  
  
1. 에피소드 열람 시 에피소드 열람 기록 저장
2. 만화의 에피소드 목록 페이지에서 extension db에 저장 되어 있는 에피소드에 대해 읽었던 시간 표시
3. 만화의 에피소드 목록 페이지 진입 시 기존 홈페이지 계정에 해당 만화의 에피소드 열람 기록이 있는 경우 해당 기록 extension db에 저장
- 읽은 시간은 1970/01/01 00:00:00 으로
4. 기존 홈페이지 계정에는 열람 기록이 없고, extension에 기록이 있는 경우 배경을 #FFC0CB 색상으로 변경하여 표시  
 
extension 계정의 경우 패스워드는 salt+hashing 하여 저장  

version 1.2  
기존에 이미 읽었던 에피소드가 extension db에 저장 되지 않던 문제 수정