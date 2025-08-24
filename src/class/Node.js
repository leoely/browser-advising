class Node  {
  constructor(options) {
    this.startTime = Date.now();
    this.options = options;
    this.rate = 0;
    this.count = 0;
  }

  getDutyCycle() {
    const {
      count,
      startTime,
    } = this;
    const nowTime = Date.now();
    return count * 1000 * 60 * 60 / (nowTime - startTime);
  }
};

export default Node;
