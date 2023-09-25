$(function() {
  let tra = new XMLHttpRequest();

  tra.onreadystatechange = function(){
    if (tra.readyState == 4){
      // 受信したデータの処理を記述する
      $("#result")
    }
  }

  $("#崩壊").click(function(){
    alert("無事")
  });
});
