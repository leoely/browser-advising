import Router from '~/class/Router';
import WebThing from '~/class/WebThing';

function parsePathKeys(url) {
  let status = 0;
  let chars = [];
  let url1 = url;
  const pathKeys = [];
  outer: for (let i = url.length - 1; i >= 0; i -= 1) {
    const char = url.charAt(i);
    switch (status) {
      case 0: {
        if (char === '}') {
          status = 1;
        } else {
          break outer;
        }
        break;
      }
      case 1: {
        if (char === '{') {
          status = 2;
        } else {
          chars.unshift(char);
        }
        break;
      }
      case 2: {
        if (char === '/') {
          const pathKey = chars.join('')
          pathKeys.unshift(pathKey);
          chars = [];
          status = 3;
        } else {
          throw new Error('[Error] There should be a slash line there.');
        }
        break;
      }
      case 3: {
        if (char === '/') {
          url1 = url.substring(0, i);
          break outer;
        } else if (char === '}') {
          status = 1;
        }
        break;
      }
    }
  }
  return [url1, pathKeys];
}

function parsePathValues(url) {
  let status = 0;
  let chars = [];
  let url1 = url;
  let pathValues = [];
  outer: for (let i = url.length - 1; i >= 0; i -= 1) {
    const char = url.charAt(i);
    switch (status) {
      case 0: {
        if (char === '/') {
          pathValues.unshift(chars.join(''));
          chars = [];
          status = 1;
        } else {
          chars.unshift(char);
        }
        break;
      }
      case 1: {
        if (char === '/') {
          url1 = url.substring(0 , i);
          break outer;
        } else {
          chars.unshift(char);
          status = 0;
        }
        break;
      }
    }
  }
  if (url1 === url) {
    pathValues = [];
  }
  return [url1, pathValues];
}

function parseQueryParams(url) {
  let status = 0;
  let chars = [];
  let value;
  let url1 = url;
  const queryParams = {};
  outer: for (let i = url.length - 1; i >= 0; i -= 1) {
    const char = url.charAt(i);
    switch (status) {
      case 0: {
        if (char === '=') {
          value = chars.join('');
          chars = [];
          status = 1;
        } else if (char === '/') {
          break outer;
        } else {
          chars.unshift(char);
        }
        break;
      }
      case 1: {
        if (char === '&') {
          queryParams[chars.join('')] = value;
          chars = [];
          status = 0;
        } else if (char === '?') {
          queryParams[chars.join('')] = value;
          url1 = url.substring(0, i);
          break outer;
        } else {
          chars.unshift(char);
        }
        break;
      }
    }
  }
  return [url1, queryParams];
}

function getPathsFromUrl(url, hideError) {
  try {
    if (typeof url !== 'string') {
      throw new Error('[Error] Path type must be a string.');
    } else {
      if (url === '/') {
        throw new Error('[Error] Unable to operate the root path.');
      }
    }
    if (url.charAt(0) !== '/') {
      throw new Error('[Error] Path should start with a slash.');;
    }
    const paths = url.split('/');
    return paths.slice(1, paths.length);
  } catch (error) {
    if (hideError === true) {
      return [];
    } else {
      throw error;
    }
  }
}

class WebRouter extends Router {
  getPathsFromLocation(location) {
    const url = location;
    let paths;
    const {
      options: {
        hideError,
      },
    } = this;
    return getPathsFromUrl(url, hideError);
  }

  getThingClass() {
    return WebThing;
  }

  attach(url, content) {
    const [url1, pathKeys] = parsePathKeys(url);
    const {
      options: {
        hideError,
      },
    } = this;
    if (url1 === url) {
      const paths = getPathsFromUrl(url, hideError);
      this.add(url, paths, content);
    } else {
      const paths = getPathsFromUrl(url1, hideError);
      this.add(url, paths, content, pathKeys);
    }
  }

  replace(url, multiple) {
    const [url1, pathKeys] = parsePathKeys(url);
    const {
      options: {
        hideError,
      },
    } = this;
    if (url1 === url) {
      const paths = getPathsFromUrl(url, hideError);
      this.update(url, paths, multiple);
    } else {
      const paths1 = getPathsFromUrl(url1, hideError);
      this.update(url1, paths1, multiple, pathKeys);
    }
  }

  exchange(url1, url2) {
    const {
      options: {
        hideError,
      },
    } = this;
    const paths1 = getPathsFromUrl(url1, hideError);
    const paths2 = getPathsFromUrl(url2, hideError);
    this.swap(url1, url2, paths1, paths2);
  }

  revise(url, content) {
    const {
      options: {
        hideError,
      },
    } = this;
    const paths = getPathsFromUrl(url, hideError);
    this.fix(url, paths, content);
  }

  setPathKeys(url) {
    const {
      options: {
        debug,
        hideError,
      },
    } = this;
    const [url1, pathKeys] = parsePathKeys(url);
    const paths1 = getPathsFromUrl(url1, hideError);
    const thing = this.match(url1, paths1, true);
    thing.setPathKeys(pathKeys);
  }

  gain(url) {
    return this.matchInner(url, false, true);
  }

  matchInner(url, needThing, web) {
    const [url1, queryParams] = parseQueryParams(url);
    const [url2, pathValues] = parsePathValues(url1);
    const {
      options: {
        hideError,
      },
    } = this;
    let pathVariables = {};
    let thing;
    let content;
    if (url2 !== url) {
      const paths2 = getPathsFromUrl(url2, hideError);
      thing = this.match(url2, paths2, true, true);
      if (needThing !== true) {
        const { total, } = this;
        if (thing === undefined) {
          const {
            options: {
              hideError,
            },
          } = this;
          if (hideError === true) {
            content = undefined;
          } else {
            throw new Error('[Error] No matching node found.');
          }
        } else {
          content = thing.getContent(total, url2);
        }
      }
      if (pathValues.length === 0) {
        pathVariables = {};
      } else {
        if (thing !== undefined) {
          const pathKeys = thing.getPathKeys();
          if (Array.isArray(pathKeys)) {
            if (pathKeys.length === pathValues.length) {
              pathVariables = {};
              for (let i = 0; i < pathKeys.length; i += 1) {
                const key = pathKeys[i];
                const value = pathValues[i];
                pathVariables[key] = value;
              }
            } else {
              throw new Error('[Error] Format of the URL is incorrect.');
            }
          }
        }
      }
    } else {
      const paths = getPathsFromUrl(url, hideError);
      const multiple = this.match(url, paths, needThing);
      if (needThing === true) {
        thing = multiple;
      } else {
        content = multiple;
      }
    }
    if (needThing === true) {
      if (web === true) {
        return {
          thing,
          queryParams,
          pathVariables,
        };
      } else {
        return thing;
      }
    } else {
      if (web === true) {
        return {
          content,
          queryParams,
          pathVariables,
        };
      } else {
        return content;
      }
    }
  }
}

export default WebRouter;
