$(function() {
  let tra = new XMLHttpRequest();

  tra.onreadystatechange = function(){
    if (tra.readyState == 4){
      if (tra.status == 200){
        $('#notice').text("通信成功");
        $("#result").val(tra.responseText);
      }else{
        $("#notice").html(`${tra.status} 通信ミス`);
      }
    }
  }

  $("#崩壊").click(function(){
    if ($("#input").val() == "") {
			alert("何か入力して下さい");
			$("#input").focus();
			return;
		}
		if ($("#input").val().length > 200) {
			alert("文字列は200文字以内で入力して下さい");
			$("#input").focus();
			return;
		}
    let ur = "https://script.google.com/macros/s/AKfycbyTYTcTLSFTg7PzjgWDPG7MTafvNR3pI_gcjDd6QPYbR7-iDBt4iMEyjoZNhQCEbNwiCw/exec?text=" + $("#input").val();
    tra.open("GET", ur);
    tra.send(null);
  });
});
