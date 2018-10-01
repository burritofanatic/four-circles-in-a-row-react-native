# Four Circles In a Row! (Will Ha)

## To Get Started

All the packages that are needed to run this app have been installed. Assuming that you have node, watchman, and the React Native CLI installed, you can start the application by running "react-native run-ios" or "react-native run-android" from the command line. Otherwise, please refer to [this page](https://facebook.github.io/react-native/docs/getting-started.html) to get those dependencies installed. You can also run the code natively from their respective iOS and Android folders through Xcode or Android Studio.

### Running the Web Server

The backing web server is running on a Hobby Heroku tiered Dyno, and the client is currently pointed there; you will not need to run the server yourself. For instructions to run locally, you can refer to the Go project's README file.

### The Web Server

The web server was written in Go, and utilizes a skeleton open source starter project to support different "rooms" for chat on top of [Gorilla](https://github.com/gorilla/websocket). The original project can be accessed here: [wsrooms](https://github.com/godwhoa/wsrooms). I chose to write the server in Go, as it's part of the company stack, and I used it as an opportunity to learn a new language.

The source for the go project can be viewed [here](https://github.com/burritofanatic/four-cirlces-in-a-row-in-go).

#### Websockets

I made [Websockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) the main feature of the web server. Given the requirements of playing games in real time, matching users, and exchange of messages, this technology is fitting as it will not require the clients to continuously poll the server for any new information.

#### Models

The two main models or concepts on the server are *Rooms* and *Games*. A room is a channel that is created on the server that houses the players connected, the board/game state, among others.

```go
type Room struct {
	Name        string 					`bson:"name" json:"name"`
	Clients     map[string]*Client
	Count       int                  	`bson:"count" json:"count"`
	Index       int                     `bson:"index" json:"index"`
	IsNew       bool                    `bson:"is_new" json:"is_new"`
	Turn        int                     `bson:"turn" json:"turn"`
	Board       [][]int              	`bson:"board" json:"board"`
	FirstScore  int                    	`bson:"first_score" json:"first_score"`
	SecondScore int                  	`bson:"second_score" json:"second_score"`
	InPlay      bool                	`bson:"in_play" json:"in_play"`
	Winner      int                    	`bson:"winner" json:"winner"`
	PlayerId    map[string]string    	`bson:"player_id" json:"player_id"`
	CurrentGame *Game                  	
	Games       []string              	`bson:"games" json:"games"`
	ID          bson.ObjectId			`bson:"_id" json:"id"`
	Tied		bool					`bson:"tied" json:"tied"`
	RematchRequest map[string]bool
}
```

The room object is the primary driver as to what is sent across to the connected clients for gameplay. Like a physical room, users and come and go and start playing a game, but unlike one when both players leave, the room is deleted from memory. Rooms can be resurrected with information stored in a database only when a game is unfinished, and both players are disconnected from the websocket. In the event that a user reconnects, the server fetches any game objects where the user left an unfinished game, if there is one, a new instance of room is created with the state stored, allowing the players to continue.

A game object holds similar information, including the room it's played in. A new game is created whenever someone wins, ties, or loses, including resignation. A unique aspect to the game object is that it holds board states of a single game. That is, each time a move is made, the array holding the two-dimensional array, which represents the position of the players' pieces, is appended with a new board state. This allows the client to persist and playback games historically.

```go
type Game struct {
	ID				bson.ObjectId	`bson:"_id" json:"id"`
	PlayerOne		string			`bson:"player_one" json:"player_one"` // These will be the deviceIds
	PlayerTwo		string			`bson:"player_two" json:"player_two"`
	BoardStates		[][][]int		`bson:"board_states" json:"board_states"`
	Winner			string 			`bson:"winner" json:"winner"` // player 1 or 2
	WinnerId		string 			`bson:"winner_id" json:"winner_id"` // deviceId
	Room			string			`bson:"room" json:"room"`
	TurnCount		int				`bson:"turn_count" json:"turn_count"`
}
```

DAO objects for both models are used to store and fetch from the MongoDB database.

The concept of a room does represent some challenges, namely, ensuring that a user does not occupy both seats upon reconnection or an existing game of a game in play, or that the state is restored properly. Giving the user the ability to leave a room to seek out other players makes this an issue. I made the effort to ensure that when the room is empty, the room is deleted from memory to prevent any unwanted users from sitting in an in-play game, and that player position assignment is done based on what is available as opposed to how many users are in the room (0 or 1).

#### Gameplay

##### The Board

Intuitively, the board is represented by a two-dimensional array, zeros represent empty positions, 1 red, and 2 black.

##### Moves

When a user makes a move, the client sends the POST request with the column chosen, along with their UUID generated upon launch, and room name. Prior to placing the user's move on the board, checks are done to ensure that the user is moving in turn, that they are authorized (not the other player), and that there is still space in the column.

Once a move is valid and placed on the board, the server checks to see if there is a win by virtue of four in a row, or if a tie should be declared.

Then, the server sends out a message to the connected clients for the specific room with new information regarding the game state.

##### Chat

Chatting is handled through a POST request, which gets relayed like a move by a user, and is broadcasted through the websocket connection. It is rudimentary and only identifies the user by their player position.

#### Testing

There are some basic Go tests that check the rules behind the joining of users and for a winning position in a game. These tests could be expanded and can encourage better readability and separation of concerns in the source.

### The React Native Application

The client-side implementation was done using React Native. Much of the game logic was offloaded to the server, and the client side application is just a way to make moves and display the current state of the games.

#### Connection with the server

The websocket connection is established when a user first starts the app. Although the user has already found a room and has taken a seat, the loading screen will continue to show while the game is not in play.

Each time the client receives a new message from the server through the `onmessage` callback, the DataManager passes back an object, which is used to update the game's state.

```javascript

ws.onmessage = (e) => {
  let jsonData = {}
  try {
    console.log(e.data);
    jsonData = JSON.parse(e.data);
    callback(this.parseWSResponseAndSetStates(jsonData));
  } catch(error) {
    console.log(error);
  }
};

...

parseWSResponseAndSetStates = (jsonData) => {
  const playerIdMap = jsonData['PlayerId'];
  const board = jsonData['Board'];
  const turn = jsonData['Turn'];
  const scoreOne = jsonData['ScoreOne'];
  const scoreTwo = jsonData['ScoreTwo']
  const room = jsonData['Room'];
  const winner = jsonData['Winner'];
  const inPlay = jsonData['InPlay'];
  const turnCount = jsonData['TurnCount'];
  const message = jsonData['Message'];
  const isTied = jsonData['tied'];
  const requestRematchMap = jsonData['RematchRequest'];

  return {
    playerIdMap: playerIdMap,
    board: board,
    turn: turn,
    scoreOne: scoreOne,
    scoreTwo: scoreTwo,
    room: room,
    winner: winner,
    inPlay: inPlay,
    turnCount: turnCount,
    message: message,
    isTied: isTied,
    requestRematchMap: requestRematchMap
  };
}

```

#### UI

![Board](https://raw.githubusercontent.com/burritofanatic/four-in-row-writeup/master/documentation/board.png)

The notable pieces of the game are broken into `ConnectBoard.js`, `ColumnButton.js`, `HistoryScreen.js`, and `LoadingScreen.js`. ConnectBoard takes in as prop, a two-dimensional array, which is then iterated through to be represented by Views. The ColumnButton component is overlayed on top of the board and acts as buttons that initiate the POST requests for moves.

The HistoryScreen is a FlatList that reuses ConnectBoard component to display both the ending state of a game and when pressed, allows for playback. This is accomplished by iterating through the board states with a timeout and updating the board component with the new state.

![History](https://raw.githubusercontent.com/burritofanatic/four-in-row-writeup/master/documentation/history.gif)


#### Additional Features

The user is given the ability to request a rematch when a game is over; the other user can accept the request, or decide to leave the room and play in another game if it's available.

![Rematch](https://raw.githubusercontent.com/burritofanatic/four-in-row-writeup/master/documentation/rematch.png)

#### Testing

Basic UI tests are done via Jest's Snapshot to ensure that there will not be unintentional changes to the UI of the components. Like testing on the server side, these tests can be expanded upon, and will likely result in better readability and separation of concerns in the code.
