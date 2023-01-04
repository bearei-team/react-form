import type { Stores } from '..';

export type NamePath<T> = keyof T | (keyof T)[];

const handleNamePath = <T extends Stores = Stores>(name?: NamePath<T>) => {
  const formatName = Array.isArray(name) ? name : name && [name];

  return name ? formatName : undefined;
};

export default handleNamePath;
