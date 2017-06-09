import { KeyBindingUtil } from 'draft-js'
import { removeBlock } from '../constants'

// Event -> EditorState -> string U {undefined}
export default getBlockTypes => (evt) => {
  const key = evt.key
  const ctrl = KeyBindingUtil.isCtrlKeyCommand(evt)
  if (
    removeBlock.keys.indexOf(key) < 0 &&
    !(ctrl && key === 'h')// see RichUtils.handleKeyCommand
  ) { return () => undefined }
  return (editorState) => {
    // selection collapsed ?
    const selection = editorState.getSelection()
    if (!selection.isCollapsed()) { return undefined }

    // cursor at end of current block ?
    const offset = selection.getStartOffset()
    if (offset !== 0) { return undefined }

    // do we have a prev block
    const blockKey = selection.getStartKey()
    const content = editorState.getCurrentContent()
    const blockBefore = content.getBlockBefore(blockKey)
    if (!blockBefore) { return undefined }
    const blockType = blockBefore.getType()
    if (getBlockTypes().indexOf(blockType) < 0) { return undefined }
    const targetBlockKey = blockBefore.getKey()

    return JSON.stringify(
      removeBlock.getAction({
        key,
        blockType,
        blockKey: targetBlockKey,
      }),
    )
  }
}
