export const pluginName = 'editable-block-component-helper'
export const arrows =
  ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft']
export const arrowUp = arrows[0]
export const arrowRight = arrows[1]
export const arrowDown = arrows[2]
export const arrowLeft = arrows[3]
export const backspace = 'Backspace'

export const H = 'handled'
export const NH = 'not-handled'

export const enterBlock = {
  keys: arrows,
  type: 'enterBlock',
  getAction: ({ key, blockKey, blockType }) => ({
    type: enterBlock.type,
    payload: {
      key,
      blockKey,
      blockType,
    },
  }),
}

export const removeBlock = {
  keys: [backspace],
  type: 'removeBlock',
  getAction: ({ key, blockKey, blockType }) => ({
    type: removeBlock.type,
    payload: {
      key,
      blockKey,
      blockType,
    },
  }),
}
