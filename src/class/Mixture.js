import Cluster from '~/class/Cluster';
import Thing from '~/class/Thing';

class Mixture {
  constructor(cluster, thing) {
    this.dealParams(cluster, thing);
    this.hash = [cluster, thing];
    cluster.checkMemory();
  }

  dealParams(cluster, thing) {
    if (!(cluster instanceof Cluster)) {
      throw new Error('[Error] The parameter cluster should be of cluster type.');
    }
    if (!(thing instanceof Thing)) {
      throw new Error('[Error] The parameter thing should be of thing type.');
    }
  }

  getCluster() {
    return this.hash[0];
  }

  getThing() {
    return this.hash[1];
  }
}

export default Mixture;
