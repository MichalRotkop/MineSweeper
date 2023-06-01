'use strict'

const MINE = '💣'
const FLAG = '🚩'

var gBoard
var gLevel
var gGame
var gMinesToMark
var gCellsToShow

function onInit() {
    gLevel = {
        size: 8,
        mines: 14
    }
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gGame.isOn = true
    gBoard = buildBoard()

    gMinesToMark = gLevel.mines
    gCellsToShow = gLevel.size ** 2 - gLevel.mines
    console.log('gMinesToMark:', gMinesToMark)
    console.log('gCellsToShown:', gCellsToShow)

    renderBoard(gBoard)


    console.table(gBoard)
}

function onNewGame() {
    gGame.isOn = true
    document.querySelector('.modal').style.display = 'none'
    gBoard = buildBoard()
    renderBoard(gBoard)
    console.log('gLevel:', gLevel)


}

// Builds the board Set the mines Call setMinesNegsCount() Return the created board
function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }

    // board[1][1].isMine = true
    // board[2][2].isMine = true
    // board[3][3].isMine = true
    // board[4][4].isMine = true
    // board[5][5].isMine = true
    // board[6][6].isMine = true

    placeMinesRandomly(board)
    setMinesNegsCount(board)
    return board
}

function placeMinesRandomly(board) {
    for (var i = 0; i < gLevel.mines; i++) {
        var emptyPos = findEmptyPos(board)
        var currEmptyCell = board[emptyPos.i][emptyPos.j]
        currEmptyCell.isMine = true
    }
}

function findEmptyPos(board) {
    var emptyPoss = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j]
            if (cell.isMine === false) {
                var pos = {
                    i: i,
                    j: j
                }
                emptyPoss.push(pos)
            }
        }
    }
    const randIdx = getRandomIntExclusive(0, emptyPoss.length)
    const randPos = emptyPoss[randIdx]
    return randPos
}

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
    // update modal
    i = +elCell.dataset.i
    j = +elCell.dataset.j
    var currCell = gBoard[i][j]

    if (gGame.isOn === false) return
    // console.log('currCell:', currCell)
    if (currCell.isMine && currCell.isMarked === false) {
        gameOver()
    } else if (currCell.isMarked === true || currCell.isShown) {
        return
    } else if (currCell.minesAroundCount > 0) {
        handleShownCells(i, j, gBoard)
        //update DOM
        elCell.querySelector('span').hidden = false
    } else {
        expandShown(gBoard, elCell, i, j)
        handleShownCells(i, j, gBoard)
    }
    console.log('currCell:', currCell)
    console.log('gGame.shownCount:', gGame.shownCount)
    checkGameOver()
}

function onCellMarked(elCell, ev) {
    ev.preventDefault()
    var elH4 = elCell.querySelector('h4')
    var i = +elCell.dataset.i
    var j = +elCell.dataset.j
    var currCell = gBoard[i][j]

    if (currCell.isShown || !gGame.isOn) return

    if (elH4.innerHTML === FLAG) {
        elH4.innerHTML = ''
        currCell.isMarked = false
        gGame.markedCount--
        if (currCell.isMine) gMinesToMark++
    } else {
        elH4.innerHTML = FLAG
        currCell.isMarked = true
        gGame.markedCount++
        if (currCell.isMine) gMinesToMark--
    }
    checkGameOver()
}

function expandShown(board, elCell, i, j) {

    for (var k = i - 1; k <= i + 1; k++) {
        if (k < 0 || k >= board.length) continue
        for (var l = j - 1; l <= j + 1; l++) {
            if (k === i && l === j) continue
            if (l < 0 || l >= board[k].length) continue
            if (!board[k][l].isMine && !board[k][l].isMarked) {
                var elNegCell = document.querySelector(`[data-i="${k}"][data-j="${l}"]`)
                elNegCell.querySelector('span').hidden = false
                if (!board[k][l].isShown) {
                    handleShownCells(k, l, board)
                }
                // console.log(elNegCell)
            }
        }
    }
}

function handleShownCells(i, j, board) {
    const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
    elCell.classList.add('shown')
    board[i][j].isShown = true
    gGame.shownCount++
}

function checkGameOver() {
    if (gMinesToMark === 0 && gGame.shownCount === gCellsToShow)
        alert('you win!')
}

function gameOver() {
    gGame.isOn = false
    // stop timer
    // smiley sad
    // red marks losing bomb

    //if flagged right = keep flag don't show bomb in same cell
    //if flagged wrong = keep flag but mark it as wrong guess
    var elMineCells = document.querySelectorAll('.mine')
    for (var i = 0; i < elMineCells.length; i++) {
        elMineCells[i].querySelector('span').hidden = false
    }
}

function menuPopUp() {
    document.querySelector('.modal').style.display = 'block'
}

function chooseLevel(elCell) {
    var elBtns = document.querySelectorAll('.choices button')
    for (var i = 0; i < elBtns.length; i++) {
        elBtns[i].style.backgroundColor = 'rgb(220, 235, 235)'
    }
    gLevel.size = +elCell.dataset.size
    gLevel.mines = +elCell.dataset.mines
    elCell.style.backgroundColor = 'rgba(88, 128, 131, 0.848)'

}

function getRandomIntExclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
}


// TODO BASICS:
// set levels
// fix flags and bombs on same cell when losing
//
// TODO NEXT:
// timer
// restart button
// expandShown() full (if neg cell.minesAroundCount === 0 -check expandShown on negs,
//  and reveal only if cell !=... )
// gameOver(): on lose: smiley sad, red marks losing bomb, timer stops
// colored numbers

//TODO LAST:
//BONUS
//CSS

