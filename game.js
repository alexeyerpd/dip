'use strict';
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  plus(obj) {
    try {
      if (!Vector.prototype.isPrototypeOf(obj)) {
        throw 'Можно прибавлять к вектору только вектор типа Vector';
      }
    	let newVector = new Vector(this.x, this.y);
      newVector.x += obj.x;
      newVector.y += obj.y;
      return newVector;
    } catch (err) {
    	console.log(err);
      return obj;
    }
  }
  
  times(factor = 1) {
    let newVector = new Vector(this.x, this.y);
    newVector.x *= factor;
    newVector.y *= factor;
    return newVector;
  }
}