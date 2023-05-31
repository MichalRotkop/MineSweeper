'use strict'

const MINE = '💣'

var gBoard
var gLevel
var gGame

function onInit() {
    gLevel = {
        size: 4,
        mines: 2
    }
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gBoard = buildBoard(gLevel.size)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
    console.table(gBoard)
}

// Builds the board Set the mines Call setMinesNegsCount() Return the created board
function buildBoard(size) {
    var board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    board[1][1].isMine = true
    board[3][2].isMine = true
    return board
}

// Render the board as a <table> to the page
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            var className = currCell.isShown ? 'shown' : ''
            strHTML += `<td class="cell ${className}"
            onclick="onCellClicked(this,${i},${j})"
            data-i="${i}" data-j="${j}"><span hidden>`
            if (currCell.isMine) {
                strHTML += MINE
            } else {
                strHTML += (currCell.minesAroundCount === 0) ? '' : currCell.minesAroundCount
            }
            strHTML += '</span></td>'
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegsCount(board) {
    for (var currRow = 0; currRow < board.length; currRow++) {
        for (var currCol = 0; currCol < board[0].length; currCol++) {
            var currCell = board[currRow][currCol]
            // console.log('currCell:',currCell)
            for (var k = currRow - 1; k <= currRow + 1; k++) {
                if (k < 0 || k >= board.length) continue
                for (var l = currCol - 1; l <= currCol + 1; l++) {
                    if (k === currRow && l === currCol) continue
                    if (l < 0 || l >= board[k].length) continue
                    if (board[k][l].isMine) currCell.minesAroundCount++
                }
            }
        }
    }
}

function onCellClicked(elCell, i, j) {
    console.log('elCell:',elCell)
    // if right click - onCellMarked(elCell)

    // update modal
    i = elCell.dataset.i
    j = elCell.dataset.j
    var currCell = gBoard[i][j]
    
    currCell.isShown = true
    console.log('currCell:',currCell)

    //update DOM

    elCell.querySelector('span').hidden = false
   

}

function expandShown(board, elCell, i, j) {

}

// TODO BASICS:
// left click: disable click on shown/marked
// expandShown() 1st degree opening
// checkGameOver(): 1.lose: on blowup 2. win: when all mines are marked + all cell shown
// right click: marks (modal & DOM). 2nd click unmarks (modal & DOM)
//
// TODO NEXT: 
// random mines placing
// set levels
// expandShown() full






/*
{
    showCustomMenu();
    return false;     // cancel default menu
}
*/