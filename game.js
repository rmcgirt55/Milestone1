class Game {
    constructor(ctx) {
        this.ctx = ctx;

        this.currentPiece = null;
        this.nextPiece = new Piece(SHAPES[Math.floor(Math.random() * SHAPES.length)], this.ctx);
        this.heldPiece = null;

        this.paused = false;
        this.gameover = false;
        this.linesCleared = 0;
        this.score = 0;

        this.grid = [];
        for (let i = 0; i < ROWS; i++) {
            let row = [];
            for (let j = 0; j < COLS; j++) {
                row.push(0);
            }
            this.grid.push(row);
        }
    }

    reset() {
        this.currentPiece = null;
        this.nextPiece = new Piece(SHAPES[Math.floor(Math.random() * SHAPES.length)], this.ctx);
        this.heldPiece = null;

        this.gameover = false;
        this.linesCleared = 0;
        this.score = 0;

        this.grid = [];
        for (let i = 0; i < ROWS; i++) {
            let row = [];
            for (let j = 0; j < COLS; j++) {
                row.push(0);
            }
            this.grid.push(row);
        }

        this.showSelf();
    }

    

    showSelf() {
        this.grid.forEach( (row, i) => row.forEach( (tile, j) => {
            drawRect(this.ctx, j * SQ, i * SQ, SQ, SQ, COLORS[tile]);
        }));

        if (this.currentPiece != null) {
            this.showShadow();
            this.currentPiece.showSelf();
        }

        
        let scoreText = document.getElementById('score-ctr');
        scoreText.textContent = this.score;
    }

    showShadow() {
        
        let shadowPiece = this.currentPiece.shape.map( row => row.map( x => x ) );
        let x = this.currentPiece.x;
        let y = this.currentPiece.y;
        while (!this.collision(x, y + 1, shadowPiece)) {
            y++;
        }
        
        shadowPiece.forEach( (row, i) => row.forEach( (tile, j) => {
            if (tile != 0) {
                drawRect(this.ctx, (x + j) * SQ, (y + i) * SQ, SQ, SQ, COLORS[tile]);
                drawRect(this.ctx, (x + j) * SQ + 7, (y + i) * SQ + 7, SQ - 14, SQ -14, COLORS[0]);
            }
        }));
    }

   

    spawnPiece() {
        
        this.currentPiece = this.nextPiece;
        this.nextPiece = new Piece(SHAPES[Math.floor(Math.random() * SHAPES.length)], this.ctx);

        this.showSelf();
    }

    holdPiece() {
        if (this.currentPiece != null) {
            if (this.heldPiece != null) {
                
                let temp = this.currentPiece;
                this.currentPiece = this.heldPiece;
                this.heldPiece = temp;

                
                this.currentPiece.x = COLS / 2 - Math.floor(this.currentPiece.shape.length / 2);
                this.currentPiece.y = 0;
            } else {
               
                this.heldPiece = this.currentPiece;
                this.spawnPiece();
            }
        }

        this.showSelf();
    }

    

    collision(x, y, shape) {
       
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape.length; j++) {
                
                if (shape[i][j] != 0) {

                    let p = x + j;
                    let q = y + i;

                    
                    if (p >= 0 && p < COLS && q < ROWS) {
                        
                        if (q >= 0 && this.grid[q][p] != 0) {
                            return true;
                        } 

                    
                    } else {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    setPiece() {
        for (let i = 0; i < this.currentPiece.shape.length; i++) {
            for (let j = 0; j < this.currentPiece.shape.length; j++) {
                
                let p = this.currentPiece.x + j;
                let q = this.currentPiece.y + i;
               
                if (q >= 0 && this.currentPiece.shape[i][j] != 0) {
                    this.grid[q][p] = this.currentPiece.shape[i][j];
                } else if (q < 0) {
                    this.gameover = true;
                }
            }
        }
        this.currentPiece = null;
    }

    getSpeed() {
        if (this.getLevel() < 11) return 1000 - (this.getLevel() - 1 ) * 100;
        else if (this.getLevel() >= 15)  return 50;
        else return 100 - (this.getLevel() - 10) * 10;
    }

   

    getLevel() {
        return Math.floor(this.linesCleared / 5) + 1;
    }

    clearLines() {
        let lineAmt = 0; 

        this.grid.forEach( (row, i) => {
           
            let prod = 1;
            row.forEach( tile => prod = prod * tile);
            if (prod != 0) {
              
                this.grid.splice(i, 1);
                this.grid.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
                this.linesCleared++;
                lineAmt++;
            }
        });

        
        switch (lineAmt) {
            case 1:
                this.score += (100 * this.getLevel());
                break;
            case 2:
                this.score += (300 * this.getLevel());
                break;
            case 3:
                this.score += (500 * this.getLevel());
                break;
            case 4:
                this.score += (800 * this.getLevel());
                break;
            default:
                break;
        }

       
        let linesText = document.getElementById('lines-ctr');
        linesText.textContent = this.linesCleared;
        let levelText = document.getElementById('level-ctr');
        levelText.textContent = this.getLevel();
        let scoreText = document.getElementById('score-ctr');
        scoreText.textContent = this.score;
    }

    

    moveDown() {
       
        if (this.currentPiece != null) {
            var y = this.currentPiece.y;
            if (!this.collision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
               
                this.currentPiece.y++;
            } else {
             
                this.setPiece();
                this.clearLines();
            }
        }
        this.showSelf();
        return y;
    }

    moveHorizontal(right) {
        
        if (this.currentPiece != null) {
            
            let dir = right ? 1 : -1;
            if (!this.collision(this.currentPiece.x + dir, this.currentPiece.y, this.currentPiece.shape)) {
                
                this.currentPiece.x += dir;
            }
        }
        this.showSelf();
    }

    rotate(clockwise) {
        
        if (this.currentPiece != null) {

            if (this.currentPiece.shape.length != 2) {

                
                let shape = this.currentPiece.shape.map( row => row.map( x => x) );
                
              
                let s = clockwise ? 1 : 3;
                while (s > 0) {

                   
                    for (let i = 0; i < shape.length; i++) {
                        for (let j = 0; j < i; j++) {
                        const temp = shape[i][j];
                        shape[i][j] = shape[j][i];
                        shape[j][i] = temp;
                        }
                    }

                    shape = shape.map( row => row.reverse());

                    s--;
                }

                let x = this.currentPiece.x,
                    y = this.currentPiece.y;
                if (this.collision(x, y, shape)) {
                   
                    for (let c = 1; c <= 2; c++) {
                        for (let i = -1 * c; i <= c; i += c) {
                            for (let j = -1 * c; j <= c; j += c) {
                                if (!this.collision(x + j, y + i, shape)) {
                                    
                                    this.currentPiece.shape = shape;
                                    this.currentPiece.x = x + j;
                                    this.currentPiece.y = y + i;
                                    this.showSelf();
                                    return;
                                }
                            }
                        }
                    }
                    
                    this.showSelf();
                    return;
                } else {
                  
                    this.currentPiece.shape = shape;
                    this.showSelf();
                    return;
                }
            }
        }
    }

    hardDrop() {
        let y0 = this.currentPiece.y
        while (this.currentPiece != null) {
            var y1 = this.moveDown();
        }
        this.score += 2 * (y1 - y0) * this.getLevel();
    }
}
