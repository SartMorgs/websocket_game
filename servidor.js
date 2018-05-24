// Módulo servidor
var express = require('express')
var app = express();

var bodyParser = require('body-parser');
const WebSocket = require('ws');												// Módulo websocket
var vectorConnections=[];														// Vetor de conexões
var http = require('http')
const TIMEOUT = 10000;															// Tempo máximo para se logar

// Criação do servidor
const wss = new WebSocket.Server({ port: 8080 },function (){
  console.log('SERVIDOR WEBSOCKETS na porta 8080');
});


function period ()
{
  let time_now = Date.now(); 													//Recebe o tempo atual

  let x = 0;
  while (x < vectorConnections.length)
  {
    if ((vectorConnections[x].validate == false) && ((time_now - vectorConnections[x].timestamp) > TIMEOUT ) )
    {
        console.log('remove usuario da lista de ativos')
        let MSG = {type:'ERRO',value:'timeout'};
        vectorConnections[x].send(JSON.stringify(MSG));
        vectorConnections[x].close();
        vectorConnections.splice(x, 1);

    }
    else x++;

  }
}

function broadcast (msg)
{
  	for (let x = 0; x < vectorConnections.length; x++){
    	try {
        	if (vectorConnections[x].validate == true) vectorConnections[x].send(JSON.stringify(msg)); 
    	}
    	catch (e){
		}
    }
}


// Compartilha com todos os usuários a lista dos que estão online
function updateUsers(){
	var users[];

	for(let x = 0; x < vectorConnections.length; xx++){
		if(vectorConnections[x].validate == true){
			users.push(vectorConnections[i].name);
		}
		else{
			// Somente usuários logados são mostrados
		}
	}

	let MSG = {type: 'USERS', value: users};									// Cria mensagem com os usuários online
	broadcast(MSG);																// Envia a informação via broadcast
}


// Envio de mensagem entre dois usuários
function privateMSG(receiver, msg){
	for(let x = 0; x < vectorConnections.length; x++){
		try{
			if(vectorConnections[x].name == receiver) vectorConnections[x].send(JSON.stringify(msg));
		}
		catch(e){

		}
	}
}


wss.on('connection', function connection(ws) {
  	ws.validate = false;
  	ws.timestamp = Date.now();													// Momento que o usuário se conectou no servidor
  	vectorConnections.push(ws);													// Adiciona no vetor de conexões

  	ws.on('close', function close() {
      	for (let x = 0; x < vectorConnections.length; x++)
      	{
        	if (vectorConnections[x] == ws) {
        		// Retira usuário da lista
            	vectorConnections.splice(x, 1);
            	break;
        	}
      	}
      	console.log('Usuário desconectou');
  	});

  	ws.on('message', function incoming(MSG) {

    	MSG = JSON.parse(MSG);													// Transforma em objeto JSON
   

    	if (MSG.type == 'LOGIN')
    	{
        	//mostra o login
        	console.log('User: ', MSG.value.ID)
        	broadcast(MSG);
        	updateUsers();
        	console.log('Usuário validado');
        	ws.name = MSG.value.ID;
        	ws.validate = true;
    	}
    	else if(MSG.type == 'CONVITE'){
    		resp = console.log("Enviando uma mensagem privada para" + MSG.value.TO);
			MSG.value.board= createBoard();
			privateMSG(MSG.value.TO, MSG);
    	}
    	else if(MSG.type == 'RESP_CONVITE'){
    		if(MSG.value.resp == true){
    			let newBoard = createBoard();

    			console.log("começou partida");
    			console.log(newBoard);
    			insertMatch(MSG.value.FROM, MSG.value.TO, newBoard);
    		}
    		// responde o convite
    		privateMSG(MSG.value.FROM, MSG);
    	}
    	else if(MSG.type == 'PARTIDA'){
    		// BELISA
    	}
	});
});


/*-------------------------------------- TABULEIRO E JOGADAS ----------------------------------*/
function createBoard{
	let board = new Array(8);
	for(let x = 0; x < 8; x++){
		board[x] = new Array(8);
	}

	for(let x = 0; x < 2; x++){
		for(y = 0; y < 8; y++){
			board[x][y] = 0;			// claro
			board[x+6][y] = 1;			// escuro
		}
	}

	console.log(board);
	return board;
}

function validPlay(/* Parâmetros */){
	// BELISA
}

function pieceMove(/* Parâmetros */){
	// BELISA
}

function insertMatch(player1, player2, board){
	var match = {player1: player1, player2: player2, board: board, turn: 0}
	matches.push(match);
}

function searchMatch(player){
	for(let x = 0; x < match.length; x++){
		if(match[x].player1.name == player.player.name || matches[x].player2.nome == player.player.name){
			console.log(matches[x].board);
			return matches[x];
		}
	}
	console.log("UNDEFINED RETURN");
	return undefined;
}

///  http://localhost:3000/sensores?temperatura=123
/*app.get('/sensores', function (req, resp) {

	var temperatura     = req.query.temperatura;
  var humidade = req.query.humidade;

  if (temperatura) console.log('temperatura=',temperatura)
  if (humidade) console.log('humidade=',humidade)


  return resp.end();
});
*/

app.use(bodyParser.json()); 
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, resp) {
  resp.write("teste");
  resp.end();
});

app.get(/^(.+)$/, function (req, res) {
  try {
    res.write("A pagina que voce busca nao existe")
    res.end();
  }
  catch(e)
  {
    res.end();
  }    
})

// Servidor rodando na porta 3000
app.listen(3000, function(){
  console.log('SERVIDOR WEB na porta 3000');
});

updateUsers();
setInterval (period,10000);
setInterval(updateUsers, 1000);