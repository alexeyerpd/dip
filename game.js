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