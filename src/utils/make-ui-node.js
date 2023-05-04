
import generateNodeInstance from './generate-ui-node-instance';

export const makeChildren = (options, data = []) => {
  if (Array.isArray(data) === true) {
    return data.map((item) => makeNode(options, item));
  } else {
    return [];
  }
};

export const makeNode = (options, data = []) => {
  const { replaceFields } = options;
  const node = generateNodeInstance(data, options);
  const children = makeChildren(options, data[replaceFields.children]);
  node.setChildren(children);
  return node;
};
