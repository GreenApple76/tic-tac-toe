
$(document).ready(function () {
var index;
var board = [];
var marker; 
var indexToLocation = {
	0: 'row1-col1',
	1: 'row1-col2',
	2: 'row1-col3',
	3: 'row2-col1',
	4: 'row2-col2',
	5: 'row2-col3',
	6: 'row3-col1',
	7: 'row3-col2',
	8: 'row3-col3'
}
var winner = false;
var almostWinner;
var markCounter = 0;
var userMark;

// set user's marker choice
$('.xmarker').click(function() {
	marker = 'x';
	userMark = 'x';
	$('.choice').css('display', 'none');
	$('.board').css('display', 'block');
});

// set user's marker choice
$('.omarker').click(function() {
	marker = 'o';
	userMark = 'o';
	$('.choice').css('display', 'none');
	$('.board').css('display', 'block');
});

// process user's mark to game board and then have computer take a turn
$('.board').on('click', function(e) {
	var boardLocation = getLocation(e);
	// if nobody has won
	if (!winner) {
		// make user mark
		mark(boardLocation);
		// check if user is a winner and switch marker to computer's marker
		isWinner(toggleMarker);

		// if nobody has won
		if (!winner) {
			// declare a draw if no more empty quadrants to make marks
			// prepare marker and game board for next game
			if (markCounter === 9) {
				$('.status').css('color', 'yellow');
				$('.status').html('<h2>It\'s a draw.</h2>');
				$('.status').css('display', 'block');
				setTimeout(function() {
					resetBoard();
				},1250);
				toggleMarker();
			// make computer mark
			} else {
				// computer's turn to make mark
				computerTurn(); 
				// check if computer is a winner and switch marker to user's marker
				isWinner(toggleMarker);
			}
		}
	}
	// winner detected, reset game board for next game
	if (winner) {
		setTimeout(function() {
			resetBoard();
		},1250);
	}
});

// set location of user's click on game board
function getLocation(e) {
	var boardLocation = e.target.className;
	// set boardLocation to placeholder's parent so that placeholder is replaced
	if (boardLocation === 'placeholder') {
		boardLocation = e.target.parentNode.className;
	} else if (boardLocation === 'mark') {
		// do not mark over an existing mark
	} else if (boardLocation === 'board') {
		// do not mark if user clicked on board border / grid line
	} else {
		boardLocation  = e.target.className;
	}
	return boardLocation;
}

// verify that computer or user selected an empty quadrant
// track the mark of computer or user
// update page with new mark
function mark(boardLocation) {
	var marked = false;
	switch (boardLocation) {
		case 'row1-col1':
			if (!board[0]) {
				board[0] = marker;
				marked = true;
			}
			break;
		case 'row1-col2':
			if (!board[1]) {
				board[1] = marker;
				marked = true;
			}
			break;
		case 'row1-col3':
			if (!board[2]) {
				board[2] = marker;
				marked = true;
			}
			break;
		case 'row2-col1':
			if (!board[3]) {
				board[3] = marker;
				marked = true;
			}
			break;
		case 'row2-col2':
			if (!board[4]) {
				board[4] = marker;
				marked = true;
			}
			break;
		case 'row2-col3':
			if (!board[5]) {
				board[5] = marker;
				marked = true;
			}
			break;
		case 'row3-col1':
			if (!board[6]) {
				board[6] = marker;
				marked = true;
			}
			break;
		case 'row3-col2':
			if (!board[7]) {
				board[7] = marker;
				marked = true;
			}
			break;
		case 'row3-col3':
			if (!board[8]) {
				board[8] = marker;
				marked = true;
			}
	}
	if (marked) {
		$('.' + boardLocation).html('<span class="mark">' + marker + '</span>');
		markCounter++;
	}
	return marked;
}

// switch active marker from user chosen mark to computer's mark or vice versa
function toggleMarker() {
	marker === 'x' ? marker = 'o' : marker = 'x';
}

// computer selects best location to place mark
function computerTurn() {
	do {
		index = undefined;
		// make computer's first move to center quadrant
		if (markCounter === 1) {
			if (!board[4]) {
				index = 4;
			// select a random corner for 2nd best first move
			} else {
				var corners = [0,2,6,8];
				index = corners[parseInt(Math.floor(Math.random()*4))];
			}
		// if user selected a corner for their second move then
		// computer's second move must be a non-corner edge quadrant
		} else if (markCounter === 3 && almostWinner === undefined) {
			// check if user has marked a corner
			var corners = [0,2,6,8];
			for (var i = 0; i < corners.length; i++) {
				if (board[corners[i]] === userMark) {
					// computer selects random non-corner edge quadrant to mark
					var noncorners = [1,3,5,7];
					index = noncorners[parseInt(Math.floor(Math.random()*4))];
					break;
				}
			}
		} else {
			// block a user's potentially winning move if user is one move away from winning
			if (almostWinner != undefined) {
				index = almostWinner;
				almostWinner = undefined;
			}

			// check if computer is one move away from winning
			isWinner();

			// if computer is one move away from winning set index location for the win
			if (almostWinner != undefined) {
				index = almostWinner;
				almostWinner = undefined;
			}

			// user is not close to winning so select any randomly available quadrant
			if (index === undefined) {
				index = parseInt(Math.floor(Math.random() * 9));
			}
		}
		// convert index value to name value (e.g. index 0 -> row1-col1)
		boardLocation = indexToLocation[index];
	} while (!mark(boardLocation));
	// keep track of quadrants that have marks	
	board[index] = marker;
}

// check game board quadrants for winning player or player that is one mark away from winning
function checkBoard(begin, end, increment) {
	var markerTotal = 0;
	var highlight = [];

	for(var i = begin; i < end; i=i+increment) {
		// count the number of matching markers
		if (board[i] === marker) {
			markerTotal++;
			// keep track of matching marker locations
			// so that they can be highlighted if there
			// is a winner detected
			highlight.push(i); 
		}
		// track empty quadrant for computer to block
		if (!board[i]) {
			blockMove = i;	
		}
	}
	// found three consecutive markers of same type, declare winner
	if (markerTotal === 3) {
		winner = true;
		// highlight winning marks
		for(var i = 0; i < highlight.length; i++) {
			boardLocation = indexToLocation[highlight[i]];
			$('.' + boardLocation).addClass('winningmark');
		}
	}
	// track quadrant that computer needs to block to prevent user from winning
	else if (markerTotal === 2 && blockMove != undefined) {
		almostWinner = blockMove;
		blockMove = undefined;
	}
	// untrack quadrant because more than 1 user mark required for win
	else {
		blockMove = undefined;
	}
	highlight = [];
}

// check if user or computer is a winner
// set almostWinner value to location of final quadrant required for user/computer to win 
function isWinner(callback) {
	checkBoard(0,3,1); // check row 1
	checkBoard(3,6,1); // check row 2
	checkBoard(6,9,1); // check row 3
	checkBoard(0,7,3); // check col 1
	checkBoard(1,8,3); // check col 2
	checkBoard(2,9,3); // check col 3
	checkBoard(0,9,4); // check 1st diagonal
	checkBoard(2,7,2); // check 2nd diagonal

	// output game status to web page
	if (winner) {
		// determine if computer or user is the winner
		if (marker === userMark) {
			$('.status').css('color', 'green');
			$('.status').html('<h2>You won!</h2>');
		} else {
			$('.status').css('color', 'red');
			$('.status').html('<h2>Sorry, you loose.</h2>');
		}
		$('.status').css('display', 'block');
	}
	if (typeof arguments[0] === 'function') {
		callback();
	}
}

// prepare variables and game board for another game
function resetBoard() {
	$('.status').css('display', 'none');
	$('.board').html('<div class="row1-col1"><span class="placeholder">-</span></div>'
                +'<div class="row1-col2"><span class="placeholder">-</span></div>'
                +'<div class="row1-col3"><span class="placeholder">-</span></div>'

                +'<div class="row2-col1"><span class="placeholder">-</span></div>'
                +'<div class="row2-col2"><span class="placeholder">-</span></div>'
                +'<div class="row2-col3"><span class="placeholder">-</span></div>'

                +'<div class="row3-col1"><span class="placeholder">-</span></div>'
                +'<div class="row3-col2"><span class="placeholder">-</span></div>'
                +'<div class="row3-col3"><span class="placeholder">-</span></div>');
	$('.board').css('display', 'block');
	markCounter = 0;
	board = [];
	winner = false;
	almostWinner = undefined;
	marker = userMark;
}
});