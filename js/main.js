'use strict'

const MINE = '💣'
const FLAG = '🚩'
const NORMAL = '🙂'
const LOSER = '😵'
const WINNER = '🥳'
const CLUELESS = '😶'
const WORRIED = '😟'
const LIVES = '💙'
const HINT = '💡'

var gBoard
var gLevel
var gGame
var gMinesToMark
var gCellsToShow
var gInterval = null
var gIsHintOn
var gHintCells

function onInit() {
    gLevel = {
        size: 8,
        mines: 14
    }
    gInterval = null
    onNewGame()
    // console.table(gBoard)
    // console.log('gLevel:', gLevel)
    // console.log('gMinesToMark:', gMinesToMark)
    // console.log('gCellsToShown:', gCellsToShow)
    // console.log('gGame.lives:', gGame.lives)
}

function onNewGame() {
    clearInterval(gInterval, 0)
    gInterval = null
    gIsHintOn = false
    gHintCells = []
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
        hints: 3,
    }
    renderTimer()

    document.querySelector('.modal').style.display = 'none'
    document.querySelector('.smiley').innerHTML = NORMAL
    document.querySelector('.lives').innerHTML = LIVES.repeat(gGame.lives)
    var elHintBtn = document.querySelector('.hint-btn')
    elHintBtn.innerHTML = HINT.repeat(gGame.hints)
    elHintBtn.style.backgroundColor = 'transparent'

    gBoard = buildBoard()
    renderBoard(gBoard)
    gMinesToMark = gLevel.mines
    gCellsToShow = gLevel.size ** 2 - gLevel.mines
}

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
                isBlownUp: false
            }
        }
    }
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
            if (cell.isMine === false && cell.isShown === false) {
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
            var classNum = currCell.minesAroundCount
            strHTML += `<td class="cell ${className} num-${classNum}"
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
    if (currCell.isMarked === true || currCell.isShown) return
    if (gIsHintOn && currCell.isShown === false) revealNegs(gBoard, i, j)
    if (currCell.isMine && currCell.isMarked === false && gIsHintOn === false) {
        if (currCell.isBlownUp) {
            return
        } else if (gGame.lives === 0) {
            elCell.style.backgroundColor = 'rgba(231, 17, 17, 0.755)'
            gameOver()
        } else {
            currCell.isBlownUp = true
            gGame.lives--
            if (gGame.lives === 0) {
                document.querySelector('.smiley').innerHTML = WORRIED
            }
            gMinesToMark--
            elCell.querySelector('span').hidden = false
            elCell.style.backgroundColor = 'rgb(248, 203, 130)'
            document.querySelector('.lives').innerHTML = LIVES.repeat(gGame.lives)
        }
    } else if (currCell.minesAroundCount > 0 && gIsHintOn === false) {
        if (gGame.secsPassed === 0) {
            startTimer()
        }
        handleShownCells(i, j, gBoard)
        elCell.querySelector('span').hidden = false
    } else if (currCell.minesAroundCount === 0 && gIsHintOn === false) {
        if (gGame.secsPassed === 0) {
            startTimer()
            currCell.isShown = true
            // gBoard = buildBoard()
            placeMinesRandomly(gBoard)
            setMinesNegsCount(gBoard)
            renderBoard(gBoard)
        }
        handleShownCells(i, j, gBoard)
        expandShown(gBoard, elCell, i, j)
    }
    checkGameOver()
    console.log('gGame.shownCount:', gGame.shownCount)
    console.log('gMinesToMark:', gMinesToMark)
    console.log('currCell:', currCell)
    console.log('gGame.lives:', gGame.lives)

}

function onCellMarked(elCell, ev) {
    ev.preventDefault()
    var elH4 = elCell.querySelector('h4')
    var i = +elCell.dataset.i
    var j = +elCell.dataset.j
    var currCell = gBoard[i][j]

    if (currCell.isShown || gGame.isOn === false) return

    if (elH4.innerHTML === FLAG) {
        elH4.innerHTML = ''
        currCell.isMarked = false
        gGame.markedCount--
        if (currCell.isMine) {
            gMinesToMark++
        }
    } else if (currCell.isBlownUp === true) {
        return
    } else {
        elH4.innerHTML = FLAG
        currCell.isMarked = true
        gGame.markedCount++
        if (currCell.isMine) gMinesToMark--
    }
    checkGameOver()
    console.log('gMinesToMark:', gMinesToMark)
    console.log('currCell:', currCell)
    console.log('gGame.markedCount:', gGame.markedCount)
}

function revealNegs(board, i, j) {
    gHintCells = []
    for (var k = i - 1; k <= i + 1; k++) {
        if (k < 0 || k >= board.length) continue
        for (var l = j - 1; l <= j + 1; l++) {
            if (l < 0 || l >= board[k].length) continue
            var elCurCell = document.querySelector(`[data-i="${k}"][data-j="${l}"]`)
            var currCell = gBoard[k][l]
            if ((currCell.isShown === false) && (currCell.isBlownUp === false)) {
                elCurCell.style.backgroundColor = 'white'
                elCurCell.querySelector('span').hidden = false
                gHintCells.push({ i: k, j: l })
            }
            // console.log(elNegCell)
        }
    }
    setTimeout(unRevealNegs, 1000)
    console.log('gHintCells:', gHintCells)
}

function unRevealNegs() {
    for (var i = 0; i < gHintCells.length; i++) {
        var elCurCell = document.querySelector(`[data-i="${gHintCells[i].i}"][data-j="${gHintCells[i].j}"]`)
        elCurCell.querySelector('span').hidden = true
        elCurCell.style.backgroundColor = null
    }
    var elHintBtn = document.querySelector('.hint-btn')
    elHintBtn.style.backgroundColor = 'transparent'
    gGame.hints--
    elHintBtn.innerHTML = HINT.repeat(gGame.hints)
    if (gGame.hints === 0) {
        document.querySelector('.smiley').innerHTML = CLUELESS
    }
    gIsHintOn = false
}

function showHint(elHint) {
    elHint.style.backgroundColor = 'white'
    gIsHintOn = true
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
                    if (board[k][l].minesAroundCount === 0) {
                        expandShown(board, elCell, k, l)
                    }
                    // console.log(elNegCell)
                }
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
    if (gMinesToMark === 0 && gGame.shownCount === gCellsToShow) {
        var elSmiley = document.querySelector('.smiley')
        elSmiley.innerHTML = WINNER
        clearInterval(gInterval, 0)
        gGame.isOn = false
    }
}

function gameOver() {
    gGame.isOn = false
    clearInterval(gInterval, 0)

    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerHTML = LOSER
    var elMineCells = document.querySelectorAll('.mine')
    for (var i = 0; i < elMineCells.length; i++) {
        var elCurrSpan = elMineCells[i].querySelector('span')
        var currCellIPos = +elMineCells[i].dataset.i
        var currCellJPos = +elMineCells[i].dataset.j
        elCurrSpan.hidden = (gBoard[currCellIPos][currCellJPos].isMarked) ? true : false
    }
}

function openPopUp() {
    document.querySelector('.modal').style.display = 'block'
}

function closePopUp() {
    document.querySelector('.modal').style.display = 'none'
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

function renderTimer() {
    var gElTimer = document.querySelector('.timer')
    var stopWatch = +gGame.secsPassed.toFixed(2)
    gElTimer.innerText = `Timer: ${stopWatch}`
}

function startTimer() {
    gInterval = setInterval(() => {
        gGame.secsPassed += 0.01
        renderTimer()
    }, 10)
}

function getRandomIntExclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
}

//BONOUS:

// expandShown() full (if neg cell.minesAroundCount === 0 -check expandShown on negs,
//  and reveal only if cell !=... )

// extras:

// CSS
