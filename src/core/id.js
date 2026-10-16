// Random ids for elements inside a component's shadow root (label targets,
// aria references). Each root is its own id scope, so collisions only matter
// within one component; 32 random bits are plenty.
export function uid(prefix = '') {
  return prefix + crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
}
