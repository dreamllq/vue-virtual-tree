export type KeyType = string | number;

export interface ReplaceFields{
  children?: string,
  title?:string,
  key?:string,
  isLeaf?:string
}

export interface TreeOptions {
  disabled?: boolean,
  checkable?:boolean,
  selectable?:boolean,
  checkStrictly?:boolean,
  autoExpandParent?:boolean,
  replaceFields?:ReplaceFields,
  loadData?: (node?:any) => any[],
  data?:any[]
}