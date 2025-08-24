import Node from '~/class/Node';

function checkContent(content) {
  if (content === undefined || content === null || Number.isNaN(content)) {
    throw Error('[Error] Value should be reasonable value.');
  }
}

class Thing extends Node {
  constructor(options, content) {
    checkContent(content);
    super(options);
    this.content = content;
  }

  match(total, location) {
    this.count += 1
    const { count, } = this;
    this.rate = count / total;
    const { rate, } = this;
    const dutyCycle = this.getDutyCycle();
  }

  getContent(total, location) {
    if (typeof total !== 'number') {
      throw new Error('[Error] Get content parameter total should be a numberic type.');
    }
    if (typeof location !== 'string') {
      throw new Error('[Error] Get content parameter location should be a string type.');
    }
    this.match(total, location);
    return this.content;
  }

  setContent(content) {
    checkContent(content);
    this.content = content;
    this.debugInfo('set content successfully');
  }
}

export default Thing;
