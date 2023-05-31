'use strict'

const MINE = '💣'
const FLAG = '🚩'

var gBoard
var gLevel
var gGame

function onInit() {
    gLevel = {
        size: 8,
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
    board[4][5].isMine = true
    board[7][6].isMine = true
    board[2][4].isMine = true
    board[5][5].isMine = true
    return board
}

// Render the board as a <table> to the page
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            var className = currCell.isMine ? 'mine' : ''
            strHTML += `<td class="cell ${className}"
            onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(this,event)"
            data-i="${i}" data-j="${j}"><h4></h4><span hidden>`
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
    console.log('elCell:', elCell)
    // if right click - onCellMarked(elCell)

    // update modal
    i = +elCell.dataset.i
    j = +elCell.dataset.j
    var currCell = gBoard[i][j]

    currCell.isShown = true
    // console.log('currCell:', currCell)

    //update DOM
    elCell.querySelector('span').hidden = false

    if (!currCell.isMine && currCell.minesAroundCount === 0 && !currCell.isMarked) {
        expandShown(gBoard, elCell, i, j)
    }

    if (currCell.isMine) gameOver()
}

function onCellMarked(elCell, ev) {
    // console.log('ev:',ev)
    console.log('elCell:',elCell)
    

    ev.preventDefault()
    var elH4 = elCell.querySelector('h4')
    var i = +elCell.dataset.i
    var j = +elCell.dataset.j
    var currCell = gBoard[i][j]
    console.log('currCell:',currCell)

    if (currCell.isShown) return
    
    
    if (elH4.innerHTML === FLAG) {
        elH4.innerHTML = ''
        currCell.isMarked = false
    } else {
        elH4.innerHTML = FLAG
        currCell.isMarked = true

    }
    console.log('currCell:',currCell)
}

function expandShown(board, elCell, i, j) {

    for (var k = i - 1; k <= i + 1; k++) {
        if (k < 0 || k >= board.length) continue
        for (var l = j - 1; l <= j + 1; l++) {
            if (k === i && l === j) continue
            if (l < 0 || l >= board[k].length) continue
            // if (mat[i][j] === LIFE || mat[i][j] === SUPER_LIFE) negsCount++
            if (!board[k][l].isMine && !board[k][l].isMarked) {
                var elNegCell = document.querySelector(`[data-i="${k}"][data-j="${l}"]`)
                elNegCell.querySelector('span').hidden = false
                board[k][l].isShown = true
                // console.log(elNegCell)
            }
        }
    }
}



function gameOver() {
    gGame.isOn = false
    // stop timer
    // smiley sad
    // red marks losing bomb
    var elMineCells = document.querySelectorAll('.mine')
    for (var i = 0; i < elMineCells.length; i++) {
        elMineCells[i].querySelector('span').hidden = false
    }

}


// TODO BASICS:
// left click: disable click on shown/marked - no need?
// expandShown() 1st degree opening 😍
// right click: marks (modal & DOM). 2nd click unmarks (modal & DOM). updates gGame.markedCount
// checkGameOver(): if win: when all mines are marked + all cell shown
// random mines placing
//
// TODO NEXT:
// set levels
// timer
// gameOver(): on lose: smiley sad, red marks losing bomb, timer stops
// restart button
// expandShown() full
// colored numbers

