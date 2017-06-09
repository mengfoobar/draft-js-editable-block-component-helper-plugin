import { enterBlock, H, arrowUp, arrowDown } from '../constants'
import { zipToFn } from '../higherOrderFns'

// Key -> [ Key -> a] -> a
const enterKeysTo = zipToFn(enterBlock.keys)
// int -> int -> bool
const cursorAtEnd = offset => maxOffset =>
  offset === maxOffset
// int -> a -> bool
const cursorAtBegin = offset => _ =>
  offset === 0
const cursorOnLastLine = _ => _ => {
  const browserSel = document.getSelection()
  const {bottom: b, height} = browserSel
    .getRangeAt(0)
    .getBoundingClientRect()
  const {bottom: B} = browserSel.anchorNode
    .parentNode
    .getBoundingClientRect()
  return b + height > B
}
const cursorOnFirstLine = _ => _ => {
  const browserSel = document.getSelection()
  const {top: t, height} = browserSel
    .getRangeAt(0)
    .getBoundingClientRect()
  const {top: T} = browserSel.anchorNode
    .parentNode
    .getBoundingClientRect()
  return t - height < T
}
// Key -> int -> int -> bool
const cursorPositionIsCorrect = enterKeysTo([
  cursorOnFirstLine,
  cursorAtEnd,
  cursorOnLastLine,
  cursorAtBegin,
])
// CS -> BlockKey -> Block
const getBlockAfter = content => blockKey =>
  content.getBlockAfter(blockKey)
// CS -> BlockKey -> Block
const getBlockBefore = content => blockKey =>
  content.getBlockBefore(blockKey)
// key -> CS ->BlockKey -> Block
const targetBlockFn = enterKeysTo([
  getBlockBefore,
  getBlockAfter,
  getBlockAfter,
  getBlockBefore,
])

// Key -> ES -> {blockKey: string, blockType: string}
const isEnterBlockMotion = key => {
  const isCursorWellPositioned = cursorPositionIsCorrect(key)
  const getTargetBlock = targetBlockFn(key)
  return editorState => {
    const selection = editorState.getSelection()
    if (!selection.isCollapsed()) { return {} }
    const content = editorState.getCurrentContent()
    const blockKey = selection.getStartKey()
    const offset = selection.getStartOffset()
    const maxOffset = content.getBlockForKey(blockKey).getLength()
    if (!isCursorWellPositioned(offset)(maxOffset)) { return {} }
    const targetBlock = getTargetBlock(content)(blockKey)
    if (!targetBlock) { return {} }
    return {
      blockKey: targetBlock.getKey(),
      blockType: targetBlock.getType(),
    }
  }
}

// Event -> EditorState -> string U {undefined}
export default getBlockTypes => e => {
  const key = e.key
  if (enterBlock.keys.indexOf(key) < 0) { return () => undefined }
  const iEBM = isEnterBlockMotion(key)
  return es => {
    const {blockKey, blockType} = iEBM(es)
    if (!blockType || getBlockTypes().indexOf(blockType) < 0) { return undefined }

    return JSON.stringify(
      enterBlock.getAction({
        key,
        blockKey,
        blockType,
      })
    )
  }
}

// (ES, Handler) -> Event -> bool
export const specialBindings = getBlockTypes => (es, handler) => e => {
  const key = e.key
  if ([arrowUp, arrowDown].indexOf(key) < 0) { return false }
  const {blockKey, blockType} = isEnterBlockMotion(key)(es)
  if (!blockType || getBlockTypes().indexOf(blockType) < 0) {
    return false
  }
  if (
    handler(JSON.stringify(
      enterBlock.getAction({
        key,
        blockKey,
        blockType,
      })
    )) === H
  ) {
    e.preventDefault()
    return true
  }
  return false
}
