# manatoki_read_history
For chrome extension

팝업페이지
  회차 타이틀을 N개 요청
  return

히스토리 가져오기
  목록 페이지
    타이틀을 찾는다.
    타이틀로 조회 요청한다.
    테이블에서 타이틀을 찾는다.
      있으면 회차 타이틀 테이블에서 조회하여 결과 return
    없으면 
      없다고 reutrn
    
타이틀 저장하기
  만화 페이지
    타이틀을 찾는다.
    회차 타이틀을 찾는다.
    타이틀과 회차 타이틀의 저장 요청한다.
    테이블에 타이틀이 있는지 확인한다.
      없으면 타이틀 저장.
      회차 타이틀이 있는지 확인한다.
        있으면 읽은 시간 업데이트
      없으면 
        회차 타이틀 저장
