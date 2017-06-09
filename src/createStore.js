import { Map } from 'immutable'

export default () => {
  let state = {
    lockedBy: {
      isRootEditorReadOnly: null,
      component: null,
      payload: null,
    },
    components: Map(),
    blockTypes: [],
  }

  const pluginFns = {}

  const listeners = {}

  const subscribeToItem = (key, callback) => {
    listeners[key] = listeners[key] || []
    listeners[key].push(callback)
  }

  const unsubscribeFromItem = (key, callback) => {
    listeners[key] = listeners[key].filter(listener =>
      listener !== callback,
    )
  }

  const updateItem = (key, item) => {
    const prev = state[key]
    if (prev === item) { return }
    state = {
      ...state,
      [key]: item,
    }
    if (listeners[key]) {
      listeners[key].forEach(listener => listener(state[key], prev))
    }
  }

  const lock = (by, payload = null) => {
    if (pluginFns.getReadOnly()) { return }
    pluginFns.setReadOnly(true)
    updateItem('lockedBy', {
      ...state.lockedBy,
      component: by,
      payload,
    })
  }

  const unlock = () => {
    if (pluginFns.getReadOnly()) { return }
    updateItem('lockedBy', {
      ...state.lockedBy,
      component: null,
      payload: null,
    })
    pluginFns.setReadOnly(false)
    setTimeout(() => pluginFns.getEditorRef().focus(), 0)
  }

  const isOk = comp =>
    comp.props && comp.props.block && comp.onLockChange
  const isFn = f => typeof f === 'function'

  const refreshBlockTypes = (components) => {
    const newBlockTypes = []
    components.forEach((c) => {
      const bt = c.props.block.getType()
      if (newBlockTypes.indexOf(bt) < 0) {
        newBlockTypes.push(bt)
      }
      state.blockTypes = newBlockTypes
    })
  }


  const register = (componentOrCallback) => {
    if (isFn(componentOrCallback)) {
      subscribeToItem('lockedBy', componentOrCallback)
    } else {
      const component = componentOrCallback
      if (isOk(component)) {
        const block = component.props.block
        state.components = state.components.set(block.getKey(), component)
        refreshBlockTypes(state.components)
        subscribeToItem('lockedBy', component.onLockChange)
      }
      // throw an error message !!
    }
  }

  const unregister = (componentOrCallback) => {
    if (isFn(componentOrCallback)) {
      unsubscribeFromItem('lockedBy', componentOrCallback)
    } else {
      const component = componentOrCallback
      if (isOk(component)) {
        const block = component.props.block
        state.components = state.components.delete(block.getKey())
        refreshBlockTypes(state.components)
        unsubscribeFromItem('lockedBy', component.onLockChange)
      }
    }
  }

  const getComponents = () => state.components
  const getBlockTypes = () => state.blockTypes
  const updateReadOnly = () => {
    if (typeof pluginFns.getReadOnly === 'function') {
      const readOnly = pluginFns.getReadOnly()
      if (state.lockedBy.isRootEditorReadOnly !== readOnly) {
        updateItem('lockedBy', {
          ...state.lockedBy,
          isRootEditorReadOnly: readOnly,
        })
      }
    }
  }

  const getLockedBy = () => state.lockedBy

  const init = ({ getReadOnly, setReadOnly, getEditorRef }) => {
    pluginFns.setReadOnly = setReadOnly
    pluginFns.getEditorRef = getEditorRef
    pluginFns.getReadOnly = getReadOnly
    state.lockedBy.isRootEditorReadOnly = getReadOnly()
  }

  return {
    // private
    init,
    getBlockTypes,
    updateReadOnly,

    // public
    // BlockComponentOrCallBack -> void,
    register,
    // BlockComponentOrCallBack -> void
    unregister,
    // _ -> { component: BlockComponent, payload: Object }
    getLockedBy,
    // _ -> Map(BlockKey -> BlockComponent)
    getComponents,
    // (BlockComponent, ?Object) -> void
    lock,
    // _ -> void
    unlock,
  }
}
