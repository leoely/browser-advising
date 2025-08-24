import Cluster from '~/class/Cluster';
import checkCompound from '~/lib/checkCompound';

class Fusion {
  constructor(blend, compound, cluster) {
    this.dealParams(blend, compound, cluster);
    this.hash = [blend, compound];
    cluster.checkMemory();
  }

  dealParams(blend, compound, cluster) {
    const {
      constructor: {
        name,
      },
    } = blend;
    switch (name) {
      case 'Object':
      case 'Array':
        break;
      default:
        throw new Error('[Error] The parameter array should be of object type.');
    }
    checkCompound(compound);
  }

  getBlend() {
    return this.hash[0];
  }

  setBlend(blend) {
    const {
      constructor: {
        name,
      },
    } = blend;
    switch (name) {
      case 'Array':
      case 'Object':
        break;
      default:
        throw new Error('[Error] The parameter object should be of object type.');
    }
    this.hash[0] = blend;
  }

  getCompound() {
    return this.hash[1];
  }

  setCompound(compound) {
    this.hash[1] = compound;
  }
}

export default Fusion;
