import Node from '~/class/Node';

export default function checkCompound(compound) {
  if (!(compound instanceof Node)) {
    throw new Error('[Error] The compound type dose not match the expected type.');
  }
}
