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
  
  times(factor) {
    return new Vector(this.x * factor, this.y * factor);
  }
}

class Actor { 
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1) , speed = new Vector(0, 0)) { 
    if (pos instanceof Vector) { 
      this.pos = pos; 
    } else { 
      throw new Error('Свойство pos не является вектором'); 
    } 

    if (size instanceof Vector) { 
      this.size = size; 
    } else { 
      throw new Error('Свойство size не является вектором'); 
    } 

    if (speed instanceof Vector) { 
      this.speed = speed; 
    } else { 
      throw new Error('Свойство speed не является вектором'); 
    } 
  }

  act() {} 

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
      throw new Error(`Объект ${moveObj} не является экземпляром класса Actor`); 
    } 

    if (this === moveObj) { 
      return false; 
    }

    return Level.isObjectsIntersects(this, moveObj);
  } 
} 

class Level { 
  constructor(grid, actors) { 
    this.grid = grid; 
    this.actors = actors; 
    this.player = this.checkPlayer(actors);
    this.height = this.checkHeight(grid);
    this.width = this.checkWidth(grid);
    this.status = null;
    this.finishDelay = 1;
  } 

  checkWidth(array) {
    if (typeof array === 'undefined' ) {
      return 0;
    }
  
    return Math.max(...array.map(cell => {
      return cell && cell.length || 1;
    }));
  }

  checkHeight(array) {
    if (typeof array === 'undefined') {
      return 0;
    } else {
      return array.length;
    }
  }

  isActors(array) {
    return array.filter(actor => {
      return actor instanceof Actor
    });
  }
  
  checkPlayer(actors) {
    if (typeof actors === 'undefined') {
      return 'player';
    }
    for (let actor of actors) {
      if (actor.type === 'player') {
        return actor;
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
    let forIntersectObj = [];
    if ( !(moveObjActor instanceof Actor) || (typeof moveObjActor === 'undefined') ) {
      throw new Error(`${moveObjActor} не является движущимся объектом класса Actor`)
    }

    if (typeof this.actors === 'undefined' || this.actors.length === 1) {
      return undefined;
    }

    return this.actors.map(actor => {
      if (actor instanceof Actor) {
        if (actor.isIntersect(moveObjActor)) {
          return actor
        }
      }  
    }).filter(el => el !== undefined).shift()
  }

  obstacleAt(movePos, sizeMovePos) {

    if ( !(movePos instanceof Vector) && !(sizeMovePos instanceof Vector) ) {
      throw new Error(`${movePos} и ${sizeMovePos} не является вектором`);
    }
    
    if (movePos.x < 0 || (movePos.x + sizeMovePos.x) > this.width || movePos.y < 0 || (movePos.y + sizeMovePos.y) > this.height ) {
      if ((movePos.y + sizeMovePos.y) > this.height) {
        return 'lava';
      } else {
        return 'wall';
      }
    }

    for (let i = Math.floor(movePos.y); i < Math.ceil(movePos.y + sizeMovePos.y); i++) {
      for (let j = Math.floor(movePos.x); j < Math.ceil(movePos.x + sizeMovePos.x); j++) {
        if (this.grid[i][j] === 'lava') {
          return 'lava'
        }
        if (this.grid[i][j] === 'wall') {
          return 'wall'
        }
      }
    }
    
    let isActorAt = this.actorAt(new Actor(movePos, sizeMovePos));
    
    if (typeof isActorAt !== 'undefined' && isActorAt.killable) {
      return isActorAt.type;
    } else {
      return undefined;
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
    
    let hasActor = [];
    for (let actor of this.actors) {
      if (actor instanceof Actor) { 
        if (actor.type === typeActor) {
          hasActor.push(actor.type.includes(typeActor));
        }
      }
    }
    
    if (hasActor.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  playerTouched(typeObstacle, touchedMoveObj) {
    if (this.status !== null) {
      return;
    }
    
    if (typeObstacle === 'lava' || typeObstacle === 'fireball') {
      return (this.status = 'lost');
    }

    if (typeObstacle === 'coin' && (touchedMoveObj.type === 'coin')) {
      this.actors.splice(this.actors.indexOf(touchedMoveObj), 1);
      if (this.noMoreActors('coin')) {
        this.status = 'won';
      }
    }
  }

  static contains( rect, point ) {
    return rect[0].x < point.x && rect[1].x > point.x
      && rect[0].y < point.y && rect[3].y > point.y;
  }

  static isObjectsIntersects( obj1, obj2) {
    const getPoints = (obj) => {
      return [
        new Vector(obj.pos.x, obj.pos.y),
        new Vector(obj.pos.x + obj.size.x, obj.pos.y),
        new Vector(obj.pos.x + obj.size.x, obj.pos.y + obj.size.y),
        new Vector(obj.pos.x, obj.pos.y + obj.size.y)
      ];
    };

    let pointsInObj1 = getPoints(obj1);
    let pointsInObj2 = getPoints(obj2);

    const equals = (point1, point2) => {
      return point1.x === point2.x && point1.y === point2.y;
    };

    const slideCheck = (pointsInObj1, pointsInObj2) => {
      if (pointsInObj1[0].x === pointsInObj2[0].x && pointsInObj1[3].x === pointsInObj2[3].x
        && pointsInObj1[1].x === pointsInObj2[1].x && pointsInObj1[2].x === pointsInObj2[2].x) {
        return pointsInObj1[2].y > pointsInObj2[1].y && pointsInObj1[1].y < pointsInObj2[1].y
          || pointsInObj1[1].y < pointsInObj2[2].y && pointsInObj1[2].y > pointsInObj2[2].y;
      } else if (pointsInObj1[0].y === pointsInObj2[0].y && pointsInObj1[1].y === pointsInObj2[1].y
        && pointsInObj1[2].y === pointsInObj2[2].y && pointsInObj1[3].y === pointsInObj2[3].y) {
        return pointsInObj1[0].x < pointsInObj2[1].x && pointsInObj2[1].x < pointsInObj1[1].x
          || pointsInObj1[1].x > pointsInObj2[0].x && pointsInObj2[0].x > pointsInObj1[0].x;
      }
    };

    return pointsInObj1.every((point1, index) => equals(point1, pointsInObj2[index]))
      || slideCheck(pointsInObj1, pointsInObj2)
      || pointsInObj2.some(point => {
          return this.contains(pointsInObj1, point);
        }) || pointsInObj1.some(point => {
          return this.contains(pointsInObj2, point);
        });
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
    return stringArray.map((string, indX) => {
      return string.split('').map((cell, indY) => {
        return this.obstacleFromSymbol(cell)
      })
    });
  }

  createActors(stringArray) {
    let act = [];
    stringArray.forEach((str, y) => {
      str.split('').forEach((symbol, x) => {
        let Check = this.actorFromSymbol(symbol)
        if (Check === Actor) {  
          act.push(new Check(new Vector(x, y)));
        } else if (Check === symbol) {
          act.push(Check);
        } else if (Check && typeof Check === 'function') {
          let exemplar = new Check(new Vector(x, y));
          if (exemplar instanceof Actor) {
            act.push(exemplar);
          }
        }
      })
    })
    return act
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

  get killable () {
    return true;
  }
  
  getNextPosition(time = 1) {
    return new Vector(this.pos.x + this.speed.x * time,this.pos.y + this.speed.y * time);
  }
  
  handleObstacle() {
    this.speed.x *= -1;
    this.speed.y *= -1;
  }
  
  act (time, level) {
    let newPos = this.getNextPosition(time);
    let obstacle = level.obstacleAt(newPos, this.size);
    if (!obstacle || obstacle === 'fireball') {
      this.pos = newPos;
    } else {
      this.handleObstacle();
    }
  }
}

class HorizontalFireball extends Fireball{
  constructor(pos = new Vector(0,0)) {
    super(pos, new Vector(1,1));
    this.speed = new Vector(2,0)
  }
}

class VerticalFireball extends Fireball {
  constructor(pos = new Vector(0,0)) {
    super(pos, new Vector(1,1));
    this.speed = new Vector(0,2)
  }
}

class FireRain extends Fireball{
  constructor(pos = new Vector(0,0)) {
    super(pos, new Vector(1,1));
    this.savePos = pos
    this.speed = new Vector(0,3)
  }

  handleObstacle() {
    this.pos = this.savePos;
  }
}

class Coin extends Actor {
  constructor(pos) {
    super(pos, new Vector(0.6, 0.6));
    this.pos = this.pos.plus(new Vector(0.2, 0.1));
    this.save = new Vector(this.pos.x, this.pos.y);
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * 2 * Math.PI;
  }

  get type() {
    return 'coin';
  }

  updateSpring(time = 1) {
    this.spring = this.spring + this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    return new Vector(this.pos.x, this.save.y + this.getSpringVector().y)
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor {
  constructor(pos) {
    super(pos, new Vector(0.8, 1.5));
    this.pos = this.pos.plus(new Vector(0, -0.5))
  }
  
  get type() {
    return 'player';
  }
}

loadLevels().then(text => {
  return JSON.parse(text);
}).then(schemas => {
  const actorDict = {
    'x': 'wall',
    '!': 'lava',
    '@': Player,
    'o': Coin,
    '=': HorizontalFireball,
    '|': VerticalFireball,
    'v': FireRain,
  }
  const parser = new LevelParser(actorDict);
  return runGame(schemas, parser, DOMDisplay);
}).then(status => {
  alert('You won');
});