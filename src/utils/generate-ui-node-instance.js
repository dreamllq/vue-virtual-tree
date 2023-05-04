import UiNode from '../models/ui-node';

export default (data, options) => {
  const { replaceFields } = options;
  return new UiNode({
    originData: data,
    nodeMapStorage: options.nodeMapStorage,
    selectedKeyStorage: options.selectedKeyStorage,
    checkedKeysStorage: options.checkedKeysStorage,
    expandedKeysStorage: options.expandedKeysStorage,
    visibleKeysStorage: options.visibleKeysStorage,
    title: data[replaceFields.title],
    key: data[replaceFields.key],
    data: data.data,
    disabled: data.disabled === undefined ? options.disabled : data.disabled,
    selectable: data.selectable === undefined ? options.selectable : data.selectable,
    checkable: data.checkable === undefined ? options.checkable : data.checkable,
    icon: data.icon,
    isLeaf: data[replaceFields.isLeaf],
    disableCheckbox: data.disableCheckbox
  });
};
