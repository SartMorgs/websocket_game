var webServer;
var websocket;
var buttonConnect = O('entra-user');
var userid = O('user');
var myID;

// dados da partida atual, se existir
var matchCurrent;

// verifica se o usuário está em partida
var onCurrent = false;

var logUsers;


webServer = 'ws://' + window.location.hostname + ':8080';
verificaBDLocal();

// Usuário se conectou
buttonConnect.addEventListener('click', function(){
	submit();
}, false);

userid.addEventListener('keydown', function(e){
	if(e.keyCode == 13){
		envia();
	}
}, false);

function submit(){
	let userData = {ID: userid};

	userConnectScreen();							// Mostra a tela de conectados
	startConnection(userData);						// Cria um websocket
	userData = JSON.stringify(userData);			
	localStorage.setItem('DADOS', userData);
}

/*function checkLocalBD(){
	let lido = localStorage.getItem('DADOS');
	if(lido != undefined){
		let lido2 = JSON.parse(lido);
		console.log(lido2);
		myID = lido2;
		startConnection(lido2);
		userConnectScreen();
	}
	else{
		loginScreen();
	}
}
*/

function loginScreen(){
	O('login-container').style.visibility = 'visible';
	O('users-container').style.visibility = 'hidden';
}

function userConnectScreen(){
	O('login-container').style.visibility = 'hidden';
	O('users-container').style.visibility = 'visible';
}

function O(id){
	return document.getElementById(id);
}

// Cria um websocket
function startConnection(id){
	myID = id;
	websocket = new ReconnectingWebSocket(webServer)
	websocket.onopen = function(evt){
		onOpen(evt)
	}
	websocket.onclose = function(evt){
		onClose(evt)
	}
	websocket.onmessage = function(evt){
		onMessage(evt)
	}
}

function onOpen(evt){
	console.log('onOpen')
	let MSG = {
		type: 'LOGIN'
		value: myID
	};

	websocket.send(JSON.stringify(MSG))
	document.getElementById('user-welcome').innerHTML = "<br/>Bem vindo <destaque>" + myID.ID + "</destaque><br/><br/>";
}

function onClose(evt){
	console.log('onClose')
}

function userList(lst){
	var panel = document.getElementById('users-list');
	var str = "";

	// Cria um botão de convite para cada usuário online
	for(let x = 0; x < lst.length; x++){
		if(!(lst[x] == myID.ID)){
			str += lst[x] + "<button id=\"" + lst[x] + "\" class='conv_but' onclick=\"convBotao(this)\">Convidar</button><br/>";			
		}
	}

	if(str != logUsers){
		panel.innerHTML = str;
		logUsers = str;
	}
}


// Interação de convite entre dois usuários
function buttonInvite(btn){
	alert("" + myID + "Convidando o usuário" + btn.id);

	var convite = {FROM: myID.ID, TO:btn.id}

	websocket.send(JSON.stringify({type: "CONVITE", value: convite}));
}


function onMessage(evt){
	var msg = JSON.parse(evt.data);

	switch(msg.type){
		case 'USERS':
			userList(msg.value);
			break;

		case 'CONVITE':
			var MSG_RESP = {type: 'RESP_CONVITE', value: msg.value}
			// Envia pergunta ao usuário invitado
			var resp = confirm("Convite de partida de "+ msg.valor.FROM +", deseja aceitar?");

			if(resp){
				MSG_RESP.value.resp = true;

				board = MSG_RESP.value.board;
				inMatch = true;								// Usuários em partida
				matchCurrent = {side: 0, enemy: msg.value.FROM, board: board, turn: msg.value.TO};
				alert("Vez do oponente");

				// Função que desenha o tabuleiro 
				// BELISA
			}
			else{
				MSG_RESP.valor.resp = false;
			}

			websocket.send(JSON.stringify(MSG_RESP));
			break;
		
		case 'RESP_CONVITE':
			if(msg.value.resp == true){
				alert("O usuário aceitou o convite, começando partida!");
				board = msg.value.board;
				matchCurrent = {side: 1, enemy: msg.value.TO, board: board, turn: msg.value.FROM};
				// Função que desenha o tabuleiro 
				// BELISA
			}
			else{
				alert("O usuário recusou o convite.");
			}
			break;

		case 'ATUALIZA_TABULEIRO':
			// BELISA
			break;
	}
}

