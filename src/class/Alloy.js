import Cluster from '~/class/Cluster';
import checkCompound from '~/lib/checkCompound';

class Alloy {
  constructor(array, compound, cluster) {
    this.dealParams(array, compound, cluster);
    this.hash = [array, compound];
    cluster.checkMemory();
  }

  dealParams(array, compound, cluster) {
    if (!Array.isArray(array)) {
      throw new Error('[Error] The parameter array should be of array type.');
    }
    checkCompound(compound);
    if (!(cluster instanceof Cluster)) {
      throw new Error('[Error] The parameter cluster should be of cluster type.');
    }
  }

  getArray() {
    return this.hash[0];
  }

  setCompound(compound) {
    const {
      constructor: {
        name,
      }
    } = compound;
    switch (name) {
      case 'Cluster':
      case 'Thing':
        break;
      default:
        throw new Error('[Error] The type of the parameter mixture should be within the expected type.');
    }
    this.hash[1] = compound;
  }

  getCompound() {
    return this.hash[1];
  }
}

export default Alloy;
