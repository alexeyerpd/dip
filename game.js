'use strict';
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  plus(obj) {
    if (!Vector.prototype.isPrototypeOf(obj)) {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }
    return new Vector(this.x + obj.x, this.y + obj.y);
  }
  
  times(factor = 1) {
    return new Vector(this.x * factor, this.y * factor);
  }
}

class Actor { 
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1) , speed = new Vector(0, 0)) { 
    if (pos instanceof Vector) { 
      this.pos = pos; 
    } else { 
        throw new Error(''); 
    } 

    if (size instanceof Vector) { 
      this.size = size; 
    } else { 
        throw new Error(''); 
    } 

    if (speed instanceof Vector) { 
      this.speed = speed; 
    } else { 
        throw new Error(''); 
    } 
  }

  act() {

  } 

  get left() { 
    return this.pos.x; 
  } 

  get top() { 
    return this.pos.y; 
  } 

  get right() { 
    return this.pos.x + this.size.x; 
  } 

  get bottom() { 
    return this.pos.y + this.size.y; 
  } 

  get type () { 
    return 'actor'; 
  } 

  isIntersect(moveObj) { 
    if (!(moveObj instanceof Actor) || (moveObj === 'undefined')) { 
      throw new Error('исключение'); 
    } 

    if (this === moveObj) { 
      return false; 
    } 

    if (  (this.bottom === moveObj.top || this.top === moveObj.bottom) ||
          (this.left === moveObj.right || this.right === moveObj.left)  ) { 
      return false; 
    } 

    if (  (((this.left < moveObj.right) && (this.right > moveObj.left)) || ((this.top > moveObj.bottom) && (this.bottom < moveObj.top))) || 
          (((this.left > moveObj.right) && (this.right < moveObj.left)) || ((this.top < moveObj.bottom) && (this.bottom > moveObj.top)))  ) { 
      return true; 
    } else { 
        return false; 
    } 
  } 
} 

class Level { 
  constructor(grid, actors) { 
    this.grid = grid; 
    this.actors = actors; 
    this.player = this.checkPlayer(actors);  
    this.height = this.checkHeight(grid);
    this.width = this.checkLength(grid); 
    this.status = null; 
    this.finishDelay = 1; 
  } 

  checkLength(array) { 
    if ( typeof array === 'undefined' ) {
      return 0;
    }
    let memo = []; 
    
    for (let i = 0; i < array.length; i++) { 
      if (typeof array[i] === 'undefined') {
        return array.length;
      }
      memo.push(array[i].length); 
    }
    return Math.max.apply(null, memo); 
  }

  checkHeight(array) {
    if (typeof array === 'undefined') {
      return 0;
    } else {
        return array.length;
    }
  }

  isActors(array) {
    let memo = [];
    for (let i = 0; i < array.length; i++) {  
      if (array[i] instanceof Actor) { 
        memo.push(array[i]); 
      } 
    }
    return memo;
  }
  
  checkPlayer(actors) {
    if (typeof actors === 'undefined') {
      return 'player';
    }
    let memo = [];
    for (let i = 0; i < actors.length; i++) {
      if (actors[i].type === 'player') {
        return actors[i];
      }
    }
    return 'player';
  }

  isFinished() {
    if (this.status !== null && this.finishDelay < 0) {
      return true;
    } else {
        return false;
    }
  }

  actorAt(moveObjActor) {
    let memo = [];
    if ( !(moveObjActor instanceof Actor) || (typeof moveObjActor === 'undefined') ) {
      throw new Error('ошибка в moveObjActor')
    }

    if (typeof this.actors === 'undefined' || this.actors.length === 1) {
      return undefined;
    }

    for (let i = 0; i < this.actors.length; i++) {
      if (this.actors[i] instanceof Actor && (moveObjActor !== this.actors[i])) { 
        if ( ((moveObjActor.right < this.actors[i].left && moveObjActor.left < this.actors[i].left) ||
             (moveObjActor.right > this.actors[i].right && moveObjActor.left > this.actors[i].right)) &&
             ((moveObjActor.top  > this.actors[i].top && moveObjActor.bottom > this.actors[i].top) ||
             (moveObjActor.top < this.actors[i].bottom && moveObjActor.bottom < this.actors[i].bottom)) ) {
          return undefined;
        }
      }  
    }

    for (let i = 0; i < this.actors.length; i++) {
      if (this.actors[i] instanceof Actor && (moveObjActor !== this.actors[i])) {   
        if ( (moveObjActor.left < this.actors[i].right || moveObjActor.left === this.actors[i].left) &&
             (moveObjActor.right > this.actors[i].left || moveObjActor.right === this.actors[i].right) &&
             (moveObjActor.top > this.actors[i].bottom || moveObjActor.top === this.actors[i].top) && 
             (moveObjActor.bottom < this.actors[i].top || moveObjActor.bottom === this.actors[i].bottom) ) {
          memo.push(this.actors[i]);
        }
      }  
    }

    if (memo.length === 1) {
      return memo.shift();
    } else if (memo.length > 1) {
        return memo.shift();
    } 
  }

  obstacleAt(movePos, sizeMovePos) {
    if ( !(movePos instanceof Vector) && !(sizeMovePos instanceof Vector) ) {
      throw new Error('Ошибка в obstacleAt');
    }
    
    if (movePos.x < 0 || (movePos.x + sizeMovePos.x) > this.width || movePos.y < 0 || (movePos.y + sizeMovePos.y) > this.height ) {
      if ((movePos.y + sizeMovePos.y) > this.height || movePos.y > this.height ) {
        return 'lava';
      } else {
          return 'wall';
      }
    }  
    
    let isCheckGrid = this.checkGrid(movePos, sizeMovePos)
    
    if (this.checkGrid) {
      return isCheckGrid;
    }
    
    let isActorAt = this.actorAt(new Actor(movePos, sizeMovePos));
    
    if (typeof isActorAt !== 'undefined') {
      return isActorAt.type;
    } else {
        return undefined;
    }
  } 

  checkGrid(arg1, arg2) {
    if ((typeof arg1 === 'undefined') && (typeof arg2 === 'undefined')) {
      throw new Error('ошибка в checkGrid')
    }
    
    let lava = [];
    let wall = [];
    
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (this.grid[i][j] === 'lava') {
          lava.push(new Vector(j,i));
        }
        if (this.grid[i][j] === 'wall') {
          wall.push(new Vector(j, i))
        }
      } 
    }
    
    for (let i = 0; i < wall.length; i++) {
      if ( ((wall[i].x <= (arg1.x + arg2.x)) && (wall[i].x >= arg1.x)) && ((arg1.y <= wall[i].y) && (wall[i].y <= (arg1.y + arg2.y))) ) {
        return "wall";
      }
    }
    
    for (let i = 0; i < lava.length; i++) {
      if ( ((lava[i].x <= (arg1.x + arg2.x)) && (lava[i].x >= arg1.x)) && ((arg1.y <= lava[i].y) && (lava[i].y <= (arg1.y + arg2.y))) ) {
        return "lava";
      }
    }
  }

  removeActor(removeObj) {
    if (removeObj instanceof Actor ) {
      this.actors.splice(this.actors.indexOf(removeObj), 1);
    }
  }

  noMoreActors(typeActor) {
    if (typeof this.actors === 'undefined') {
      return true;
    }
    let memo = [];
    for (let i = 0; i < this.actors.length; i++) {
      if (this.actors[i] instanceof Actor) { 
        if (this.actors[i].type === typeActor) {
          memo.push(this.actors[i].type.includes(typeActor));
        }
      }
    }
    if (memo.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  playerTouched(typeObstacle, touchedMoveObj) {
    if (this.status !== null) {
      return;
    }
    
    if (typeObstacle === 'lava' || typeObstacle ==='fireball') {
      this.status = 'lost';
    }
    
    if (typeObstacle === 'coin' && (touchedMoveObj.type === 'coin')) {
      this.actors.splice(this.actors.indexOf(touchedMoveObj), 1);
      if (this.noMoreActors('coin')) {
        this.status = 'won';
      }
    }
  }
}

class LevelParser {
  constructor(dictionary = {}) {
    this.dictionary = dictionary;
  }

  actorFromSymbol(symbol) { 
    if (this.dictionary[symbol]) {
      return this.dictionary[symbol];
    } 
  }

  obstacleFromSymbol(symbol) {
    switch (symbol) {
      case "x" : return 'wall';
      case "!" : return 'lava';
    }
  }

  createGrid(stringArray) {
    let grid = []
    for (let i = 0; i < stringArray.length; i++) {
      grid.push(stringArray[i].split(''));
      for (let j = 0; j < grid[i].length; j++) {
        grid[i][j] = this.obstacleFromSymbol(grid[i][j]);
      }
    }
    return grid;
  }

  createActors(stringArray) {
    let act = [];

    for (let i = 0; i < stringArray.length; i++) { // i = y
      for (let j = 0; j < stringArray[i].length; j++ ) {

        let Check = this.actorFromSymbol(stringArray[i][j]);

        if (Check === Actor && typeof Check === 'function') {  
          act.push(new Check(new Vector(j, i)));
        } else if (Check === stringArray[i][j]) {
          act.push(Check);
        } else if (Check && typeof Check === 'function') {
            let test = new Check(new Vector(j, i));
            if (test instanceof Actor) {
              act.push(test);
            }
        }
      }
    }
    return act;
  }

  parse(stringArray) {
    let grid = this.createGrid(stringArray);
    let actor = this.createActors(stringArray);
    return new Level(grid, actor);
  }

}

class Fireball extends Actor {
  constructor(coordinates = new Vector(0,0), speed = new Vector(0,0)) {
    super(coordinates, new Vector(1,1), speed);
  }
  
  get type() {
    return 'fireball';
  }
  
  getNextPosition(time = 1) {
    return new Vector(this.pos.x + this.speed.x * time,this.pos.y + this.speed.y * time);
  }
  
  handleObstacle() {
    this.speed.x *= -1;
    this.speed.y *= -1;
  }
  
  act(time, field) {
    if (!this.obstacleAt(field)) {
      this.pos = this.getNextPosition(time)
    }
  }
}

class HorizontalFireball {

}

class VerticalFireball {

}

class FireRain {

}

class Coin {

}

class Player {

}

const grid = [
  new Array(3),
  ['wall', 'wall', 'lava']
];
const level = new Level(grid);
runLevel(level, DOMDisplay);
