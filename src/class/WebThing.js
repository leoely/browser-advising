import Thing from '~/class/Thing';

class WebThing extends Thing {
  constructor(options, content, pathKeys) {
    super(options, content);
    this.setPathKeys(pathKeys);
  }

  setPathKeys(pathKeys) {
    if (pathKeys !== undefined) {
      if (!Array.isArray(pathKeys)) {
        delete this.pathKeys;
      } else {
        this.pathKeys = pathKeys;
      }
    }
  }

  getPathKeys() {
    const { pathKeys, } = this;
    if (pathKeys !== undefined) {
      return pathKeys;
    } else {
      const {
        options: {
          hideError,
        },
      } = this;
      if (hideError !== true)
      throw new Error('[Error] Unable to get path keys because it is not set.');
    }
  }
}

export default WebThing;
