import createStore from './createStore'
import globalUnlockHandler from './globalUnlockHandler'
import keyBindings, { specialBindings } from './keyBindings'
import { pluginName } from './constants'

export default () => {
  const store = createStore()
  const {
    init,
    getBlockTypes,
    updateReadOnly,
    ...locker
  } = store

  const installGlobalUnlockHandler = ({ getEditorRef, getReadOnly }) => {
    const id = setInterval(() => {
      const editor = getEditorRef()
      if (!editor) { return }
      const editorNode = editor.refs.editor
      editorNode.addEventListener(
        'mousedown',
        globalUnlockHandler(getReadOnly, locker, editorNode),
        true,
      )
      clearInterval(id)
    }, 5)
  }

  let idWatch
  const watchReadOnly = () => { idWatch = setInterval(updateReadOnly, 500) }

  const willUnMount = () => clearInterval(idWatch)

  return {
    initialize: (pluginFns) => {
      init(pluginFns)
      installGlobalUnlockHandler(pluginFns)
      watchReadOnly()
    },
    pluginName,
    willUnMount,
    locker,
    normalKeyBindings: keyBindings(getBlockTypes),
    specialKeyBindings: specialBindings(getBlockTypes),
  }
}
