import Fusion from '~/class/Fusion';
import Alloy from '~/class/Alloy';
import Mixture from '~/class/Mixture';
import Thing from '~/class/Thing';
import Node from '~/class/Node';
import checkCompound from '~/lib/checkCompound';

function checkChar(char) {
  if (!(typeof char === 'string' && char.length === 1)) {
    throw new Error('[Error] Char parameter should be of character type.');
  }
}

function getIndexFromChar(char, type) {
  checkChar(char);
  switch (type) {
    case 0:
      if (char >=  'A' && char <= 'Z') {
        const code = char.charCodeAt(0);
        return code - 65;
      } else if (char >= 'a' && char <= 'z') {
        const code = char.charCodeAt(0);
        return code - 97;
      } else if (char >= '0' && char <= '9') {
        const code = char.charCodeAt(0);
        return code - 48;
      } else {
        throw new Error('[Error] The current character is not within the processing range.');
      }
      break;
    case 1:
      if (char >=  'A' && char <= 'Z') {
        const code = char.charCodeAt(0);
        return code - 65 + 10;
      } else if (char >= 'a' && char <= 'z') {
        const code = char.charCodeAt(0);
        return code - 97 + 10;
      } else if (char >= '0' && char <= '9') {
        const code = char.charCodeAt(0);
        return code - 48;
      } else {
        throw new Error('[Error] The current character is not within the processing range.');
      }
      break;
      break;
    default:
      throw new Error('[Error] The current type is not expected when getting the index.');
  }
}

function bitToByte(bit) {
  if (!Number.isInteger(bit)) {
    throw new Error('[Error] Bit parameter should be of integer type.');
  }
  const byte = bit / 8;
  if (!Number.isInteger(byte)) {
    throw Error('[Error] The calculated number of bytes should be an integer.');
  }
  return byte;
}

function estimateArrInc(multiple) {
  let length;
  if (Array.isArray(multiple)) {
    const array = multiple;
    length = array.length;
  } else if (Number.isInteger(multiple)) {
    length = multiple;
  } else {
    throw new Error('[Error] The parameter multiple does not match the expected type.');
  }
  return (length * 2 + 1) * 64;
}

function estimateStr(string) {
  if (typeof string !== 'string') {
    throw new Error('[Error] String paramter should be of string type.');
  }
  const { length, } = string;
  return (length + 1) * 4 * 8;
}

function estimatePtr() {
  return 64;
}

function estimateExpandHashInc(key, type) {
  if (typeof key !== 'string') {
    throw new Error('[Error] Key paramter should be of string type.');
  }
  if (!Number.isInteger(type)) {
    throw new Error('[Error] Type paramter should be an integer type.');
  }
  const { length, } = key;
  let ans = 0;
  for (let i = 0; i < length; i += 1) {
    const char = key.charAt(i);
    const value = getIndexFromChar(char, type);
    ans += estimateArrInc(value + 1);
  }
  return ans;
}

function estimateObjInc(hash) {
  if (typeof hash !== 'object') {
    throw new Error('[Error] Inner hash should be of type object.');
  }
  let ans = estimateArrInc(5);
  const keys = Object.keys(hash);
  ans += estimateArrInc(keys.length);
  keys.forEach((key) => {
    ans += estimatePtr() + estimateStr(key);
  });
  return ans;
}

function setRootAmong(root, index, cluster) {
  if (!(cluster instanceof Cluster)) {
    throw new Error('[Error] The parameter cluster should of cluster type.');
  }
  const {
    constructor: {
      name,
    },
  } = root;
  switch (name) {
    case 'Cluster':
    case 'WebThing':
    case 'Thing': {
      const array = [];
      const compound = root;
      return new Alloy(array, compound, cluster);
    }
    case 'Alloy': {
      const alloy = root;
      const array = alloy.getArray();
      return array;
    }
    case 'Array':
      const array = root;
      return root;
    case 'Fusion': {
      const fusion = root;
      const blend = fusion.getBlend();
      return blend;
    }
    default:
      throw new Error('[Error] The root type is not in scopes.');
  }
}

function generateRootAmong(root, char, type, cluster) {
  if (!Number.isInteger(type)) {
    throw new Error('[Error] The parameter type should be an integer type.');
  }
  const index = getIndexFromChar(char, type);
  const among = root[index];
  if (among === undefined) {
    const array = [];
    root[index] = array;
    return array;
  } else {
    const {
      constructor: {
        name,
      },
    } = among;
    switch (name) {
      case 'Cluster':
      case 'WebThing':
      case 'Thing': {
        const compound = among;
        const array = [];
        const alloy = new Alloy(array, compound, cluster);
        root[index] = alloy;
        return array;
      }
      case 'Fusion': {
        const fusion = among;
        const blend = fusion.getBlend();
        return blend;
      }
      case 'Alloy': {
        const alloy = among;
        const array = alloy.getArray();
        return array;
      }
      case 'Array': {
        const array = among;
        return array;
      }
      default:
        throw new Error('[Error] In method set expand hash,the type does not match the expected.');
    }
  }
}

function deleteRootAmong(root, char, type, duplicate) {
  if (!Number.isInteger(type)) {
    throw new Error('[Error] The parameter type should be an integer type.');
  }
  if (typeof duplicate !== 'boolean') {
    throw new Error('[Error] Parameter repetition should be of boolean type.');
  }
  const index = getIndexFromChar(char, 0);
  let beforeRoot = root;
  const {
    constructor: {
      name,
    },
  } = root;
  switch (name) {
    case 'Array':
      root = root[index];
      if (duplicate === false) {
        delete beforeRoot[index];
      }
      return root;
    case 'Alloy': {
      const alloy = root;
      const array = alloy.getArray();
      root = array[index];
      if (duplicate === false) {
        delete array[index];
      }
      return root;
    }
    default:
      throw new Error('[Error] The type during the delete operateion traveral is not expected.');
  }
}

function deleteInterceptionHash(hash, key) {
  if (Array.isArray(hash)) {
    const { length, } = key;
    const lengthValue = hash[length - 1];
    delete lengthValue[key];
    const keys = Object.keys(lengthValue);
    if (keys.length === 0) {
      delete hash[length - 1];
    }
    const rests = [];
    hash.forEach((elem) => {
      if (typeof elem === 'object') {
        Object.keys(elem).forEach((key) => {
          if (elem[key] !== undefined) {
            rests.push([key, elem[key]]);
          }
        });
      }
    });
    rests.forEach(([key, value]) => {
      hash[key] = value;
    });
    return hash;
  } else {
    delete hash[key];
    const keys = Object.keys(hash);
    if (keys.length === 0) {
      hash = undefined;
    }
  }
}

function getInterceptionHash(hash, key) {
  if (Array.isArray(hash)) {
    const { length, } = key;
    if (hash[length - 1] === undefined) {
      return undefined;
    } else {
      return hash[length - 1][key];
    }
  } else {
    return hash[key];
  }
}

function setInterceptionHash(hash, key, value) {
  if (Array.isArray(hash)) {
    const { length, } = key;
    if (hash[length - 1] === undefined) {
      hash[length - 1] = {};
    }
    hash[length - 1][key] = value;
  } else {
    hash[key] = value;
  }
}

function getType(status) {
  switch (status) {
    case 2:
    case 5:
      return 0;
    case 10:
      return 1;
    default:
      throw new Error('[Error] There is no valid type in the current state.');
  }
}

class Cluster extends Node {
  constructor(options, root) {
    super(options);
    this.status = -1;
    this.number = 0;
  }

  getBranches() {
    const { status, } = this;
    switch (status) {
      case -1:
        return [];
      case 0:
      case 3:
      case 6:
      case 8: {
        const { hash, } = this;
        const keys = Object.keys(hash);
        return keys;
      }
      case 1:
      case 4:
      case 7:
      case 9:
      case 2:
      case 5:
      case 10: {
        const childrens = this.getChildrens();
        return childrens.map((children) => {
          const [key] = children;
          return key;
        });
      }
      default:
        throw new Error('[Error] The state should be in the interval [-1, 10].');
    }
  }

  addInterceptionHash(hash) {
    const {
      options: {
        number,
      },
    } = this;
    if (Array.isArray(hash)) {
      return hash;
    } else {
      const initHash = hash;
      const keys = Object.keys(initHash);
      if (keys.length >= number) {
        const middleHash = [];
        keys.forEach((key) => {
          const { length, } = key;
          if (middleHash[length - 1] === undefined) {
            middleHash[length - 1] = {};
          }
          middleHash[length - 1][key] = initHash[key];
        });
        return middleHash;
      } else {
        return initHash;
      }
    }
  }

  checkMemory(value) {
    let ans = true;
    if (navigator && typeof navigator.deviceMemory === 'number') {
      const freemem = navigator.deviceMemory;
      if (value === undefined) {
        if (freemem <= 0.5) {
          ans = false;
        }
      } else {
        if (typeof value === 'number') {
          if (freemem < value) {
            ans = false;
          }
        } else {
          throw new Error('[Error] To ensure sufficient memory,the value should be a numeric type.');
        }
      }
    }
    return ans;
  }

  set(key, value) {
    checkCompound(value);
    const { status, } = this;
    switch (status) {
      case 0:
      case 3:
      case 6:
      case 8: {
        const { hash, } = this;
        hash[key] = value;
        break;
      }
      case 1:
      case 4:
      case 7:
      case 9:
        this.appendMiddleHash(key, value);
        break;
      case 2:
      case 5:
      case 10: {
        const type = getType(status);
        const {
          options: {
            interception,
          },
        } = this;
        if (Number.isInteger(interception)) {
          let { hash: root, } = this;
          const { length, } = key;
          const min = Math.min(interception, length);
          for (let i = 0; i < min; i += 1) {
            const char = key.charAt(i);
            if (i === min - 1) {
              const tailKey = key.substring(interception, length);
              switch (tailKey) {
                case '': {
                  const index = getIndexFromChar(char, type);
                  const tail = root[index];
                  if (tail === undefined) {
                    root[index] = value;
                  } else {
                    const {
                      constructor: {
                        name,
                      }
                    } = tail;
                    switch (name) {
                      case 'Cluster':
                      case 'WebThing':
                      case 'Thing':
                        root[index] = value;
                        break;
                      case 'Array':
                      case 'Object': {
                        const blend = tail;
                        const compound = value;
                        const fusion = new Fusion(blend, compound, this);
                        root[index] = fusion;
                        break;
                      }
                      case 'Fusion': {
                        const fusion = tail;
                        const compound = value;
                        fusion.setCompound(compound);
                        break;
                      }
                      default:
                        throw new Error('[Error] An unexpected type was encountered during processing of an empty string.');
                    }
                  }
                  break;
                }
                default: {
                  const index = getIndexFromChar(char, type);
                  let tail = root[index];
                  if (tail === undefined) {
                    tail = {};
                    setInterceptionHash(tail, tailKey, value);
                    root[index] = this.addInterceptionHash(tail);
                    tail[tailKey] = value;
                  } else {
                    const {
                      constructor: {
                        name,
                      }
                    } = tail;
                    switch (name) {
                      case 'Array':
                      case 'Object':
                        setInterceptionHash(tail, tailKey, value);
                        root[index] = this.addInterceptionHash(tail);
                        break;
                      case 'Fusion': {
                        const fusion = tail;
                        let blend = fusion.getBlend();
                        setInterceptionHash(blend, tailKey, value);
                        blend = this.addInterceptionHash(blend);
                        fusion.setBlend(blend);
                        break;
                      }
                      default:
                        throw new Error('[Error] Handling truncation situation with unexpected types.');
                    }
                  }
                }
              }
            } else {
              const index = getIndexFromChar(char, type);
              if (root[index] instanceof Alloy) {
                const array = root[index].getArray();
                const nextChar = key.charAt(i + 1);
                const nextIndex = getIndexFromChar(nextChar, type);
                array[nextIndex] = [];
              }
              if (root[index] === undefined) {
                root[index] = [];
              }
              const ans = setRootAmong(root[index], index, this);
              if (Array.isArray(ans)) {
                root = ans;
              } else {
                root[index] = ans;
                root = ans.getArray();
              }
            }
          }
        } else {
          let { hash: root, } = this;
          const { length, } = key;
          for (let i = 0; i < length; i += 1) {
            const char = key.charAt(i);
            if (i === length - 1) {
              const {
                constructor: {
                  name,
                },
              } = root;
              switch (name) {
                case 'Alloy': {
                  const alloy = root;
                  const array = alloy.setCompound(value);
                  break;
                }
                case 'Array': {
                  const index = getIndexFromChar(char, type);
                  const leaf = root[index];
                  if (Array.isArray(leaf)) {
                    const array = leaf;
                    const compound = value;
                    const alloy = new Alloy(array, compound, this);
                    root[index] = alloy;
                  } else {
                    root[index] = value;
                  }
                  break;
                }
                default:
                  throw new Error('[Error] Unexpected type of deal root leaf.');
              }
            } else {
              const index = getIndexFromChar(char, type);
              if (root[index] instanceof Alloy) {
                const array = root[index].getArray();
                const nextChar = key.charAt(i + 1);
                const nextIndex = getIndexFromChar(nextChar, type);
                array[nextIndex] = [];
              }
              if (root[index] === undefined) {
                root[index] = [];
              }
              const ans = setRootAmong(root[index], index, this);
              if (Array.isArray(ans)) {
                root = ans;
              } else {
                root[index] = ans;
                root = ans.getArray();
              }
            }
          }
        }
        break;
      }
      default:
        throw new Error('[Error] The state should be in the interval [0, 10].');
    }
  }

  put(key, value) {
    checkCompound(value);
    this.checkKey(key);
    this.number += 1;
    const { status, } = this;
    switch (status) {
      case 1:
      case 2:
      case 4:
      case 5:
      case 7:
      case 9:
      case 10:
        this.pushChildrens(key, value);
      break;
    }
    this.set(key, value);
    const { number, } = this;
    if (number >= this.options.number) {
      const { status, } = this;
      switch (status) {
        case 0:
        case 3:
        case 6:
        case 8:
          this.addInitHash();
          break;
      }
    }
    const { count, } = value;
    if (count !== 0) {
      this.addCount(count);
    }
  }

  update(key, value) {
    checkCompound(value);
    const { status, } = this;
    switch (status) {
      case 1:
      case 2:
      case 4:
      case 5:
      case 7:
      case 9:
      case 10:
        this.updateChildrens(key, value);
        break;
    }
    this.set(key, value);
  }

  queryPartDuplicate(key) {
    let ans = false;
    const { status, } = this;
    switch (status) {
      case 2:
      case 5:
      case 10: {
        const type = getType(status);
        let { hash: root, } = this;
        const { length, } = key;
        outer: for (let i = 0; i < length; i += 1) {
          const char = key.charAt(i);
          const index = getIndexFromChar(char, type);
          const part = root[index];
          const {
            constructor: {
              name,
            },
          } = part;
          switch (name) {
            case 'Cluster':
            case 'WebThing':
            case 'Thing':
              if (i !== length - 1) {
                throw new Error('[Error] The timing of the type appearing during the query area overlap is not within the expected range.');
              }
              break outer;
            case 'Array': {
              const array = part;
              let count = 0;
              for (let i = 0; i < array.length; i += 1) {
                const elem = array[i];
                if (elem !== undefined) {
                  count += 1;
                }
              }
              if (count >= 2) {
                ans = true;
                break outer;
              }
              break;
            }
            case 'Fusion':
              ans = true;
              break outer;
            case 'Object': {
              const object = part;
              const keys = Object.keys(object);
              const [k] = keys;
              let count = 0;
              if (Number.isInteger(k)) {
                for (let i = 0; i < keys.length; i += 1) {
                  const key = keys[i];
                  const smallObject = object[key];
                  count += Object.keys(smallObject).length;
                }
              } else {
                count += keys.length;
              }
              if (count >= 2) {
                ans = true;
              }
              break outer;
            }
            case 'Alloy':
              ans = true;
              break outer;
            default:
              throw new Error('[Error] The type is not expected during the query area overlap process.');
          }
          root = part;
        }
        break;
      }
      default:
        throw new Error('[Error] Overlapping only occurs when hashing is extended');
    }
    return ans;
  }

  delete(key, uncheck) {
    if (uncheck !== true) {
      if (this.find(key) === undefined) {
        throw new Error('[Error] Delete router does not exist.');
      }
    }
    this.number -= 1;
    const { status, } = this;
    switch (status) {
      case 1:
      case 2:
      case 4:
      case 5:
      case 7:
      case 9:
      case 10:
        this.removeChildrens(key);
        break;
    }
    switch (status) {
      case 0:
      case 3:
      case 6:
      case 8:
        delete this.hash[key];
        break;
      case 1:
      case 4:
      case 7:
      case 9:
        this.dropMiddleHash(key);
        break;
      case 2:
      case 5:
      case 10: {
        const type = getType(status);;
        const duplicate = this.queryPartDuplicate(key);
        const {
          options: {
            interception,
          },
        } = this;
        if (Number.isInteger(interception)) {
          let { hash: root, } = this;
          let beforeRoot = root;
          let beforeChar = key.charAt(0);
          const { length, } = key;
          const min = Math.min(interception, length);
          for (let i = 0; i < min; i += 1) {
            const char = key.charAt(i);
            if (i === min - 1) {
              const index = getIndexFromChar(char, type);
              const tailKey = key.substring(interception, length);
              const tail = root[index];
              const {
                constructor: {
                  name,
                },
              } = tail;
              switch (tailKey) {
                case '':
                  switch (name) {
                    case 'Cluster':
                    case 'WebThing':
                    case 'Thing':
                      delete beforeRoot[getIndexFromChar(beforeChar, type)];
                      break;
                    case 'Fusion': {
                      const fusion = tail;
                      const object = fusion.getBlend();
                      root[index] = object;
                      break;
                    }
                    default:
                      throw new Error('[Error] The type of the empty string leaf part in the delete operation truncation is not expected');
                  }
                  break;
                default:
                  switch (name) {
                    case 'Array':
                    case 'Object':
                      root[index] = deleteInterceptionHash(tail, tailKey);
                      break;
                    case 'Fusion': {
                      const fusion = tail;
                      let blend = fusion.getBlend();
                      blend = deleteInterceptionHash(blend, tailKey);
                      fusion.setBlend(blend);
                      break;
                    }
                    default:
                      throw new Error('[Error] The type of leaf part of a non-empty string is unexpected when the delete operation truncation.');
                  }
              }
            } else {
              beforeRoot = root;
              beforeChar = char;
              root = deleteRootAmong(root, char, type, duplicate);
            }
          }
        } else {
          let { hash: root, } = this;
          const { length, } = key;
          for (let i = 0; i < length; i += 1) {
            const char = key.charAt(i);
            if (i === length - 1) {
              const index = getIndexFromChar(char, type);
              const tail = root[index];
              const {
                constructor: {
                  name,
                },
              } = tail;
              switch (name) {
                case 'Cluster':
                case 'WebThing':
                case 'Thing':
                  delete root[index];
                  break;
                case 'Alloy': {
                  const alloy = tail;
                  const array = alloy.getArray();
                  root[index] = array;
                  break;
                }
                default:
                  throw new Error('[Error] The type in the leaf part of the delete operation is unexpected.');
              }
            } else {
              root = deleteRootAmong(root, char, type, duplicate);
            }
          }
        }
        break;
      }
      default:
        throw new Error('[Error] The state should be in the interval [0, 10].');
    }
    const { hash, } = this;
    if (Object.keys(hash).length === 0) {
      delete this.hash;
      this.status = -1;
    }
  }

  clean(node, path) {
    const { number, } = this;
    if (number === 0) {
      if (!(node instanceof Cluster)) {
        throw new Error('[Error] Clean parameter node should be of cluster type.');
      }
      if (typeof path !== 'string') {
        throw new Error('[Error] Clean parameter path should be a string type');
      }
      node.delete(path);
    }
  }

  subtractCount(count, uncheck) {
    if (!Number.isInteger(count)) {
      throw new Error(
        '[Error] Count of arguments to subtractCount function be a integer.'
      );
    } else {
      this.count -= count;
      this.adjust(uncheck);
    }
  }

  addCount(count) {
    if (!Number.isInteger(count)) {
      throw new Error(
        '[Error] Count of arguments to addCount function be a integer.'
      );
    } else {
      this.count += count;
      this.adjust();
    }
  }

  estimateChildrensInc() {
    const { hash, } = this;
    if (typeof hash !== 'object') {
      throw new Error('[Error] Inner hash should be of type object.');
    }
    let ans = 0;
    const keys = Object.keys(hash);
    ans += estimateArrInc(keys);
    ans += 2 * estimateArrInc(keys);
    keys.forEach((key) => {
      ans += estimateStr(key);
      ans += estimatePtr();
    });
    return ans;
  }

  estimateExpandInitInc(type) {
    const { hash, } = this;
    if (typeof hash !== 'object') {
      throw new Error('[Error] Inner hash should be of type object.');
    }
    const keys = Object.keys(hash);
    let ans = this.estimateChildrensInc();
    keys.forEach((key) => {
      ans += estimateExpandHashInc(key, type) - estimateStr(key);
    });
    ans -= estimateObjInc(hash);
    return ans;
  }

  estimateExpandMiddleInc(type) {
    const { hash, } = this;
    if (typeof hash !== 'object') {
      throw new Error('[Error] Inner hash should be of type object.');
    }
    let ans = -estimateArrInc(hash);
    hash.forEach((multiple) => {
      if (typeof multiple === 'object') {
        const object = multiple;
        ans -= estimateObjInc(object);
        Object.keys(object).forEach((key) => {
          ans += estimateExpandHashInc(key, type);
        });
      }
    });
    return ans;
  }

  checkExpandInitMemory(type) {
    const childrensInc = this.estimateChildrensInc();
    const expandHashInc = this.estimateExpandInitInc(type);
    return this.checkMemory(childrensInc + expandHashInc);
  }

  checkExpandMiddleMemory(type) {
    const expandHashInc = this.estimateExpandMiddleInc(type);
    return this.checkMemory(expandHashInc);
  }

  appendMiddleHash(key, value) {
    const index = key.length - 1;
    const { hash, } = this;
    if (!Array.isArray(hash)) {
      throw new Error('[Error] The inner hash should be of array type.');
    }
    if (hash[index] === undefined) {
      hash[index] = {};
    }
    hash[index][key] = value;
  }

  establishHash(status) {
    if (this.greaterThresholdAndBondAndDutyCycle()) {
      switch (status) {
        case 0:
          this.status = 2;
          break;
        case 3:
          this.status = 5;
          break;
        case 8:
          this.status = 10;
          break;
      }
      this.hash = [];
    } else {
      const {
        options: {
          number,
        }
      } = this;
      if (this.number >= number) {
        switch (status) {
          case 0:
            this.status = 1;
            break;
          case 3:
            this.status = 4;
            break;
          case 6:
            this.status = 7;
            break;
          case 8:
            this.status = 9;
            break;
        }
        this.hash = [];
      } else {
        this.status = status;
        this.hash = {};
      }
    }
  }

  checkKey(key) {
    let flags = [];
    for (let i = 0; i < key.length; i += 1) {
      const char = key.charAt(i);
      if (char >= '0' && char <= '9') {
        if (flags[0] !== false) {
          flags[0] = true;
        }
      } else {
        if (flags[0] !== false) {
          flags[0] = false;
        }
      }
      if ((char>=  'A' && char <= 'Z') || ((char >= 'a' && char <= 'z'))) {
        if (flags[1] !== false) {
          flags[1] = true;
        }
      } else {
        if (flags[1] !== false) {
          flags[1] = false;
        }
      }
      if ((char >= '0' && char <= '9') || (char >= 'a' && char <= 'f')) {
        if (flags[2] !== false) {
          flags[2] = true;
        }
      } else {
        if (flags[2] !== false) {
          flags[2] = false;
        }
      }
    }
    let flag = flags.findIndex((elem) => {
      return elem === true;
    });
    switch (flag) {
      case -1: {
        const { status, } = this;
        if (status === -1) {
          this.establishHash(6);
        }
        break;
      }
      case 0: {
        const { status, } = this;
        if (status === -1) {
          this.establishHash(0);
        } else {
          switch (status) {
            case 2:
            case 0:
            case 1:
              break;
            default:
              throw new Error('[Error] Cluster is pure numeric type but the newly added is a pure letters.');
          }
        }
        break;
      }
      case 1: {
        const { status, } = this;
        if (status === -1) {
          this.establishHash(3);
        } else {
          switch (status) {
            case 5:
            case 3:
            case 4:
              break;
            default:
              throw new Error('[Error] Cluster is plain text type but the newly added type is a pure number.');
          }
        }
        break;
      }
      case 2: {
        const { status, } = this;
        if (status === -1) {
          this.establishHash(8);
        } else {
          switch (status) {
            case 2:
            case 5:
              this.reconstructionHash(10);
              break;
            case 0:
            case 3:
            case 1:
            case 4:
            case 8:
            case 9:
            case 10:
              break;
            default:
              throw new Error('[Error] The current cluster is of hexadecimal type but the newly added one is not hexadecimal.');
          }
        }
        break;
      }
    }
  }

  reconstructionHash(toStatus) {
    const { status, } = this;
    switch (status) {
      case 2:
      case 5: {
        this.hash = [];
        this.getChildrens().forEach(([key, value]) => {
          this.setExpandHash(key, value, 1);
        });
        break;
      }
      default:
        throw new Error('[Error] Incorrect state when reconstructing the hash.');
    }
  }

  mixFromCluster(mixture) {
    if (!(mixture instanceof Mixture)) {
      throw new Error('[Error] Mixture parameters needs to be of type mixture');
    }
    const cluster = mixture.getCluster();
    const { hash, childrens, } = cluster;
    this.hash = hash;
    this.childrens = childrens;
    this.mixture = mixture;
  }

  mixFromThing(mixture, path) {
    if (!(mixture instanceof Mixture)) {
      throw new Error('[Error] Mixture parameters needs to be of type mixture');
    }
    if (typeof path !== 'string') {
      throw new Error('[Error] Path parameters needs to be a string type.');
    }
    const cluster = mixture.getCluster();
    this.put(path, cluster);
    const { childrens, } = cluster;
    this.childrens = childrens;
    this.mixture = mixture;
  }

  extractToCluster() {
    delete this.mixtrue;
  }

  greaterThresholdAndBondAndDutyCycle() {
    const {
      options: {
        threshold, bond, dutyCycle,
      },
    } = this;
    if (threshold === undefined && bond === undefined && dutyCycle !== undefined) {
      return this.getDutyCycle() >= dutyCycle;
    }
    if (threshold === undefined && dutyCycle === undefined && bond !== undefined) {
      const { count, } = this;
      return count >= bond;
    }
    if (bond === undefined && dutyCycle === undefined && threshold !== undefined) {
      const { rate, } = this;
      return rate >= threshold;
    }
    if (bond !== undefined && dutyCycle !== undefined && threshold !== undefined) {
      const { count, } = this;
      return count >= bond && this.getDutyCycle() >= dutyCycle;
    }
    if (threshold !== undefined && dutyCycle !== undefined && bond === undefined) {
      const { rate, count, } = this;
      return threshold >= threshold && this.getDutyCycle() >= dutyCycle;
    }
    if (threshold !== undefined && bond !== undefined && dutyCycle === undefined) {
      const { rate, count, } = this;
      return rate >= threshold && count >= bond;
    }
    if (threshold !== undefined && bond !== undefined && dutyCycle !== undefined) {
      const { rate, count, } = this;
      return rate >= threshold && count >= bond && this.getDutyCycle() >= dutyCycle;
    }
    throw new Error('[Error] Threshold, bond and dutyCycle cannot be empty at the same time.');
  }

  lessThresholdAndBondAndDutyCycle() {
    const {
      options: {
        threshold, bond, dutyCycle,
      },
    } = this;
    if (threshold === undefined && bond === undefined && dutyCycle !== undefined) {
      return this.getDutyCycle() < dutyCycle;
    }
    if (threshold === undefined && dutyCycle === undefined && bond !== undefined) {
      const { count, } = this;
      return count < bond;
    }
    if (dutyCycle === undefined && bond === undefined && threshold !== undefined) {
      const { rate, } = this;
      return rate < threshold;
    }
    if (bond !== undefined && dutyCycle !== undefined && threshold === undefined) {
      const { count, } = this;
      return count < bond && this.getDutyCycle() < dutyCycle;
    }
    if (threshold !== undefined && dutyCycle !== undefined && bond === undefined) {
      const { rate, } = this;
      return rate < threshold && this.getDutyCycle() < dutyCycle;
    }
    if (threshold !== undefined && bond !== undefined && dutyCycle === undefined) {
      const { rate, count, } = this;
      return rate < threshold && count < bond;
    }
    if (threshold !== undefined && bond !== undefined && dutyCycle !== undefined) {
      const { rate, count, } = this;
      return rate < threshold && count < bond && this.getDutyCycle() < dutyCycle;
    }
    throw new Error('[Error] Threshold, bond and dutyCycle cannot be empty at the same time.');
  }

  get(key, total) {
    const { status, } = this;
    if (status === -1) {
      const {
        options: {
          hideError,
        },
      } = this;
      if (hideError === true) {
        return undefined;
      } else {
        throw new Error('[Error] Cluster hash is empty,please add a route first.');
      }
    }
    if (typeof total !== 'number') {
      throw new Error('[Error] Cluster acquisition method needs to pass numeric type paramter total.');
    }
    this.count += 1;
    const { count, } = this;
    this.rate = count / total;
    this.adjust();
    return this.find(key);
  }

  adjust(uncheck) {
    const {
      status,
    } = this;
    switch (status) {
      case 0:
      case 3:
      case 8: {
        let type;
        switch (status) {
          case 0:
          case 3:
            type = 0;
            break;
          case 8:
            type = 1;
            break;
        }
        if (this.greaterThresholdAndBondAndDutyCycle() && this.checkExpandInitMemory(type)) {
          this.expandInitHash(type);
        }
        break;
      }
      case 1:
      case 4:
      case 9: {
        let type;
        switch (status) {
          case 1:
          case 4:
            type = 0;
            break;
          case 9:
            type = 1;
            break;
        }
        if (this.greaterThresholdAndBondAndDutyCycle() && this.checkExpandMiddleMemory(type)) {
          this.expandMiddleHash(type);
        }
        break
      }
      case 2:
      case 5:
      case 10: {
        if (this.lessThresholdAndBondAndDutyCycle()) {
          const { number, } = this;
          if (number >= this.options.number) {
            this.reduceMiddleHash();
          } else {
            this.reduceInitHash();
          }
        }
        break;
      }
      case 6:
      case 7:
        break;
      case -1: {
        const {
          options: {
            hideError,
          },
        } = this;
        if (hideError !== true && uncheck !== true) {
          throw new Error('[Error] Adjustment operation is in unreasonable state zero');
        }
        break;
      }
      default:
        throw new Error('[Error] The status of the adjustment operation processing');
    }
  }

  find(key) {
    const { status, } = this;
    switch (status) {
      case 0:
      case 3:
      case 6:
      case 8:
        return this.hash[key];
      case 1:
      case 4:
      case 7:
      case 9: {
        const { length, } = key;
        const { hash, } = this;
        if (hash && hash[length - 1]) {
          return hash[length - 1][key];
        } else {
          return undefined;
        }
      }
      case 2:
      case 5:
      case 10: {
        const type = getType(status);
        const {
          options: {
            interception,
          },
        } = this;
        if (Number.isInteger(interception)) {
          let { hash: root, } = this;
          const { length, } = key;
          const min = Math.min(interception, length);
          for (let i = 0; i < min; i += 1) {
            const char = key.charAt(i);
            if (i === min - 1) {
              const index = getIndexFromChar(char, type);
              const tail = root[index];
              const tailKey = key.substring(interception, length);
              if (tail === undefined) {
                const {
                  options: {
                    hideError,
                  },
                } = this;
                if (hideError === true) {
                  return undefined;
                } else {
                  throw Error('In the case of truncation,the search result does not exist.');
                }
              }
              const {
                constructor: {
                  name,
                },
              } = tail;
              switch (tailKey) {
                case '':
                  switch (name) {
                    case 'Fusion': {
                      const fusion = tail;
                      const compound = fusion.getCompound();
                      return compound;
                    }
                    case 'Alloy': {
                      const alloy = tail;
                      const compound = alloy.getCompound();
                      return compound;
                    }
                    case 'Cluster':
                    case 'WebThing':
                    case 'Thing':
                      return tail;
                    case 'Array':
                    case 'Object':
                      return undefined;
                    default:
                      throw new Error('[Error] Type does not match the expected type when searching under truncated and empty string.');
                  }
                  break;
                default: {
                  switch (name) {
                    case 'Cluster':
                    case 'WebThing':
                    case 'Thing':
                      return undefined;
                    case 'Fusion': {
                      const fusion = tail;
                      const blend = fusion.getBlend();
                      return getInterceptionHash(blend, tailKey);
                    }
                    case 'Array':
                    case 'Object':
                      return getInterceptionHash(tail, tailKey);
                    default:
                      throw new Error('[Error] Type does not match the expected type when searching under truncated and non-empty string.');
                  }
                }
              }
            } else {
              const index = getIndexFromChar(char, type);
              if (root[index] === undefined) {
                return undefined;
              }
              const {
                constructor: {
                  name,
                },
              } = root[index];
              switch (name) {
                case 'Array':
                  root = root[index];
                  break;
                case 'Alloy': {
                  const alloy = root[index];
                  root = alloy.getArray();
                  break;
                }
                case 'Fusion': {
                  const fusion = root[index];
                  root = fusion.getBlend();
                  break;
                }
                case 'Cluster':
                case 'WebThing':
                case 'Thing':
                  return undefined;
                default:
                  throw new Error('[Error] The root type does not match the expected');
              }
            }
          }
        } else {
          let { hash: root, } = this;
          const { length, } = key;
          for (let i = 0; i < length; i += 1) {
            const char = key.charAt(i);
            if (i === length - 1) {
              const leaf = root[getIndexFromChar(char, type)];
              if (leaf === undefined) {
                return undefined;
              }
              const {
                constructor: {
                  name,
                },
              } = leaf;
              switch (name) {
                case 'Cluster':
                case 'Thing':
                case 'WebThing':
                  return leaf;
                case 'Alloy': {
                  const alloy  = leaf;
                  const compound = alloy.getCompound();
                  return compound;
                }
                case 'Array':
                  break;
                default:
                  throw new Error('[Error] The leaf type is not what you expected');
              }
            } else {
              const index = getIndexFromChar(char, type);
              if (root[index] === undefined) {
                return undefined;
              }
              const {
                constructor: {
                  name,
                },
              } = root[index];
              switch (name) {
                case 'Array':
                  root = root[index];
                  break;
                case 'Alloy': {
                  const alloy = root[index];
                  root = alloy.getArray();
                  break;
                }
                case 'Cluster':
                case 'WebThing':
                case 'Thing':
                  return undefined;
                default:
                  throw new Error('[Error] The root type does not match the expected');
              }
            }
          }
        }
        break;
      }
    }
  }

  getChildrens() {
    const { childrens, } = this;
    if (!Array.isArray(childrens)) {
      throw new Error('[Error] Inner childrens should be of array type.');
    }
    return childrens;
  }

  updateChildrens(key, value) {
    const childrens = this.getChildrens();
    for (let i = 0; i < childrens.length; i += 1) {
      const children = childrens[i];
      const [k] = children;
      if (k === key) {
        childrens[i] = [key, value];
        break;
      }
    }
  }

  removeChildrens(key) {
    const childrens = this.getChildrens();
    for (let i = 0; i < childrens.length; i += 1) {
      const [k] = childrens[i];
      if (k === key) {
        childrens.splice(i, 1);
        break;
      }
    }
  }

  pushChildrens(key, value) {
    const { childrens, } = this;
    if (childrens === undefined) {
      this.childrens = [];
    }
    const flag = this.childrens.every(([beforeKey]) => {
      if (key === beforeKey) {
        return false;
      } else {
        return true;
      }
    });
    if (flag === true) {
      this.childrens.push([key, value]);
    }
  }

  addInitHash() {
    const { hash, } = this;
    if (typeof hash !== 'object') {
      throw new Error('[Error] Inner hash should be of type object.');
    }
    const keys = Object.keys(hash);
    const values = keys.map((key) => hash[key]);
    this.hash = [];
    keys.forEach((key, index) => {
      const value = values[index];
      this.appendMiddleHash(key, value);
      this.pushChildrens(key, value);
    });
    const { status, } = this;
    switch (status) {
      case 0:
        this.status = 1;
        break;
      case 3:
        this.status = 4;
        break;
      case 6:
        this.status = 7;
        break;
      case 8:
        this.status = 9;
        break;
      default:
        throw new Error('[Error] Add initial hash state expection.');
    }
  }

  dropMiddleHash(key, value) {
    this.removeChildrens(key);
    const { status, } = this;
    switch (status) {
      case 1:
      case 4:
      case 7:
      case 9: {
        const { hash, } = this;
        const { length, } = key;
        delete hash[length - 1][key];
        const keys = Object.keys(hash[length - 1]);
        if (keys.length === 0) {
          delete hash[length - 1];
        }
        const {
          options: {
            number,
          },
        } = this;
        if (this.number < number) {
          this.removeMiddleHash();
        }
        break;
      }
      default:
        throw new Error('[Error] Removeing medium hash state does not work as expected.');
    }
  }

  removeMiddleHash() {
    const childrens = this.getChildrens();
    this.hash = {};
    const { hash, } = this;
    childrens.forEach((children) => {
      const [key, value] = children;
      hash[key] = value;
    });
    delete this.childrens;
    const { status, } = this;
    switch (status) {
      case 1:
        this.status = 0;
        break;
      case 4:
        this.status = 3;
        break;
      case 7:
        this.status = 6;
        break;
      case 9:
        this.status = 8;
        break;
      default:
        throw new Error('[Error] Remove initial hash state expection.');
    }
  }

  expandInitHash(type) {
    const { hash, } = this;
    if (typeof hash !== 'object') {
      throw new Error('[Error] Inner hash should be of type object.');
    }
    const keys = Object.keys(hash);
    const values = keys.map((key) => hash[key]);
    this.hash = [];
    this.childrens = [];
    keys.forEach((key, index) => {
      const value = values[index];
      this.setExpandHash(key, value, type);
      this.pushChildrens(key, value);
    });
    const { status, } = this;
    switch (status) {
      case 0:
        this.status = 2;
        break;
      case 3:
        this.status = 5;
        break;
      case 8:
        this.status = 10;
        break;
      default:
        throw new Error('[Error] expand initial hash state expection.');
    }
  }

  expandMiddleHash(type) {
    this.hash = [];
    const childrens = this.getChildrens();
    childrens.forEach((children) => {
      const [key, value] = children;
      this.setExpandHash(key, value, type);
    });
    const { status, } = this;
    switch (status) {
      case 1:
        this.status = 2;
        break;
      case 4:
        this.status = 5;
        break;
      case 9:
        this.status = 10;
        break;
      default:
        throw new Error('[Error] expand middle hash state expection.');
    }
  }

  reduceMiddleHash() {
    this.hash = [];
    const { hash, } = this;
    const childrens = this.getChildrens();
    childrens.forEach((elem) => {
      const [key, value] = elem;
      const { length, } = key;
      if (hash[length - 1] === undefined) {
        hash[length - 1] = {};
      }
      hash[length - 1][key] = value;
    });
    const { status, } = this;
    switch (status) {
      case 5:
        this.status = 4;
        break;
      case 2:
        this.status = 1;
        break;
      case 7:
        this.status = 6;
        break;
      case 10:
        this.status = 9;
        break;
      default:
        throw new Error('[Error] reduce middle hash state expection.');
    }
  }

  reduceInitHash() {
    this.hash = {};
    const childrens = this.getChildrens();
    childrens.forEach((elem) => {
      const [key, value] = elem;
      const { hash, } = this;
      hash[key] = value;
    });
    const { status, } = this;
    switch (status) {
      case 5:
        this.status = 3;
        break;
      case 2:
        this.status = 0;
        break;
      case  10:
        this.status = 8;
        break;
      default:
        throw new Error('[Error] reduce init hash state expection.');
    }
  }

  setExpandHash(key, value, type) {
    const {
      options: {
        interception,
      },
    } = this;
    if (Number.isInteger(interception)) {
      let { hash: root, } = this;
      const { length, } = key;
      const min = Math.min(interception, length);
      for (let i = 0; i < min; i += 1) {
        const char = key.charAt(i);
        if (i === min - 1) {
          const index = getIndexFromChar(char, type);
          let tail = root[index];
          const tailKey = key.substring(interception, length);
          switch (tailKey) {
            case '': {
              if (tail === undefined) {
                const compound = value
                root[index] = compound;
              } else {
                const {
                  constructor: {
                    name,
                  },
                } = tail;
                switch (name) {
                  case 'Array':
                  case 'Object': {
                    const compound = value;
                    const blend = tail;
                    const fusion = new Fusion(blend, compound, this);
                    root[index] = fusion;
                    break;
                  }
                  default:
                    throw new Error('[Error] Method set expand hash setting extended hash type does not meet expectations in the case of an empty string.');
                }
              }
              break;
            }
            default: {
              if (tail === undefined) {
                root[index] = {};
                tail = root[index];
                tail[tailKey] = value;
              } else {
                const {
                  constructor: {
                    name,
                  },
                } = tail;
                switch (name) {
                  case 'Object': {
                    const object = tail;
                    setInterceptionHash(object, tailKey, value);
                    root[index] = this.addInterceptionHash(object);
                    break;
                  }
                  case 'Fusion': {
                    const fusion = tail;
                    let blend = fusion.getBlend();
                    setInterceptionHash(blend, tailKey, value);
                    blend = this.addInterceptionHash(blend);
                    fusion.setBlend(blend);
                    break;
                  }
                  default:
                    throw new Error('[Error] Method set expand hash extends hash does not meet the expecetd type in the case of non-empty string.');
                }
              }
            }
          }
        } else {
          root = generateRootAmong(root, char, type, this);
        }
      }
    } else {
      let { hash: root, } = this;
      const { length, } = key;
      for (let i = 0; i < length; i += 1) {
        const char = key.charAt(i);
        if (i === length - 1) {
          const index = getIndexFromChar(char, type);
          const leaf = root[index];
          if (leaf === undefined) {
            root[index] = value;
          } else {
            const {
              constructor: {
                name,
              },
            } = leaf;
            switch (name) {
              case 'Cluster':
              case 'WebThing':
              case 'Thing': {
                break;
              }
              case 'Array': {
                const array = leaf;
                const compound = value;
                const alloy = new Alloy(array, compound, this);
                root[index] = alloy;
                break;
              }
              default:
                throw new Error('[Error] In method set expand hash,the type does not match the expected.');
            }
          }
        } else {
          root = generateRootAmong(root, char, type, this);
        }
      }
    }
  }
}

export default Cluster;
