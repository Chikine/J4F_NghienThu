import {games as rizz} from "../play/levels.js"
let games = rizz
localStorage.getItem('games')

const canvas = document.getElementById('board')
const ctx = canvas.getContext('2d')
/* common function */
function debug(m){
    console.trace(m)
}
function min(arr){
    return Math.min(...arr)
}
function max(arr){
    return Math.max(...arr)
}
function rand(from, to){
    return Math.random() * (to - from + 1) + from
}
function floor(n){
    return Math.floor(n)
}
/* end common function */
//default board 
let currentBoard = games[25].level.map(row => {return row.slice()})
console.log(currentBoard)
//b*square size
let s_squareSize 
//default board size: 5 * 5
let w_boardWidth = currentBoard[0].length
let h_boardHeight = currentBoard.length
//default text content
const upDownText = document.getElementById('boardHeight')
const leftRightText = document.getElementById('boardWidth')
//default board maxwidth 
const s_boardMaxWidth = 560
//default div width and height
document.getElementById('container').style.width = '720px'
document.getElementById('container').style.height = '720px'
//default board color
const evenCellColor = '#ff6f3c'
const oddCellColor = '#393e46'

//square fill function
function fillHere(arr, color, size) {
    ctx.fillStyle = color;
    ctx.fillRect(arr[1] * size, arr[0] * size, size, size);
}
/*change board size */
function changeBoardSize(){
    let width = max([5,min([w_boardWidth,40])])
    let height = max([5,min([h_boardHeight,40])])
    w_boardWidth = width
    h_boardHeight = height
    // upDownText.textContent = `${'0'.repeat((height >= 10) ? 0 : 1)}${height}`
    // leftRightText.textContent = `${'0'.repeat((width >= 10) ? 0 : 1)}${width}`
    const sum = max([width,height]) 
    s_squareSize = s_boardMaxWidth / sum
    drawCanvas()
}
changeBoardSize()

/*draw board */
function drawCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    canvas.width = s_squareSize * w_boardWidth
    canvas.height = s_squareSize * h_boardHeight
    for(let i = 0; i < h_boardHeight; i++){
        for(let j = 0; j < w_boardWidth; j++){
            fillHere([i,j], ((i + j) % 2 === 0) ? evenCellColor : oddCellColor, s_squareSize)
            const cell = currentBoard[i][j]
            const solidObjects = ['wall','pedestal']
            if(cell && cell != 'space'){
                let size = (solidObjects.includes(cell)) ? s_squareSize : s_squareSize * 0.8
                let offset = (solidObjects.includes(cell)) ? 0 : s_squareSize * 0.1
                const img = new Image()
                img.src = `../image/${cell}.png`
                img.alt = cell
                ctx.drawImage(img,j * s_squareSize + offset, i * s_squareSize + offset, size, size)
            }
        }
    }
}

drawCanvas()
/* handle user interaction */
const currentImageShow = document.getElementById('currentPiece')
const images = document.querySelectorAll('.zoomable')
images.forEach(image => {
    image.addEventListener('mouseenter', () => {
        image.classList.add('zoom')
    })
    image.addEventListener('mouseleave', () => {
        image.classList.remove('zoom')
    })
})
document.querySelectorAll('.chesspieces').forEach(image => {
    image.addEventListener('click', () => {
        document.querySelector('.chosen').remove()
        const getImg = new Image()
        getImg.src = image.src
        getImg.alt = image.alt
        getImg.classList = 'chosen'
        currentPiece = (image.alt === 'space') ? 0 : image.alt
        debug(`current piece: ${currentPiece}`)
        currentImageShow.appendChild(getImg)
    })
})

let mousePosition = [-1,-1]
let mouseHold = false
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect()
    const mouseX = event.clientX - rect.left 
    const mouseY = event.clientY - rect.top  
    const offset = -2.5 //for the mouse head
    const cell = [Math.floor((mouseY + offset)/ s_squareSize),Math.floor((mouseX + offset) / s_squareSize)]
    if(mousePosition[0] != cell[0] || mousePosition[1] != cell[1])
    {
        drawCanvas()
        ctx.globalAlpha = 0.6
        fillHere(cell,'aqua',s_squareSize)
        ctx.globalAlpha = 1.0
        mousePosition = cell
    }
})

canvas.addEventListener('mouseup', () => {
    mouseHold = false
})

canvas.addEventListener('mousedown', () => {
    mouseHold = true
})

document.getElementById('save').addEventListener('click', () => {
    let text = currentBoard.map(row => { return `[${row.map(cell => { return (typeof cell === 'string') ? `'${cell}'` : cell }).join(', ')}]` }).join(',\n');
    navigator.clipboard.writeText(`[\n${text}\n]`).then(() => {
        alert('the board is copied')
        games[25].level = currentBoard.map(row => {return row.slice()})
        localStorage.setItem('games', JSON.stringify(games))
    }).catch(err => {
        alert('Failed to copy');
    })
    debug(currentBoard)
})

document.getElementById('reset').addEventListener('click' , () => {
    currentBoard = new Array(h_boardHeight).fill(0).map(row => row = new Array(w_boardWidth).fill(0))
    drawCanvas()
    debug('reset board')
})

document.getElementById('up').addEventListener('click', () => {
    h_boardHeight++
    if(h_boardHeight <= 40) currentBoard.push(new Array(w_boardWidth).fill(0))
    requestAnimationFrame(changeBoardSize)
})
document.getElementById('down').addEventListener('click', () => {
    h_boardHeight--
    if(h_boardHeight >= 5) currentBoard.pop()
    requestAnimationFrame(changeBoardSize)
})
document.getElementById('right').addEventListener('click', () => {
    w_boardWidth++
    if(w_boardWidth <= 40) currentBoard.map(arr => arr.push(0))
    requestAnimationFrame(changeBoardSize)
})
document.getElementById('left').addEventListener('click', () => {
    w_boardWidth--
    if(w_boardWidth >= 5) currentBoard.map(arr => arr.pop())
    requestAnimationFrame(changeBoardSize)
})

/* edit board */
let currentPiece = 'pawn'
let placeInterval = setInterval(handlePlacePiece, 50)
function handlePlacePiece() {
    if(!mouseHold || currentBoard[mousePosition[0]][mousePosition[1]] === currentPiece) return
    currentBoard[mousePosition[0]][mousePosition[1]] = currentPiece
    drawCanvas()
}