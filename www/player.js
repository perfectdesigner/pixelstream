
//Get Send Receive menssage for Unreal
function HandleUE4Response(data) {
		
	switch (data){
		
		case "cancelar_server":
		alert("cancelar_server");
		case "cancelar_info":
		alert("cancelar_info");
		
	}
	
	
}

addResponseEventListener("handle_responses" HandleUE4Response)