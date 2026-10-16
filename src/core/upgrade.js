// A property set before the element was defined is stored on the instance
// and hides the class's accessor. Take it off and assign it again, so the
// setter runs (and the value is reflected) once the element is upgraded.
export function upgradeProperties(element, names) {
  for (const name of names) {
    if (Object.hasOwn(element, name)) {
      const value = element[name];
      delete element[name];
      element[name] = value;
    }
  }
}
