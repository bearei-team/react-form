import type { Stores } from '..';

export type NamePath<T = Stores> = keyof T | (keyof T)[];

const handleNamePath = <T>(name?: NamePath<T>) => {
  const formatName = Array.isArray(name) ? name : name && [name];

  return name ? formatName : undefined;
};

export default handleNamePath;
