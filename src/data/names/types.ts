/** Space separated name lists; an underscore inside a name stands for a space. */
export interface NamePool {
  first: string
  last: string
}

/** A culture that has no list of its own and borrows from others by weight. */
export type NameAlias = [culture: string, weight: number][]
