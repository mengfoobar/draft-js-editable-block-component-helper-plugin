export default (getReadOnly, locker, limit) => (e) => {
  if (getReadOnly()) { return }
  const { component } = locker.getLockedBy()
  if (!component) { return }
  const componentsNode = locker.getComponents()
    .map(compo => compo.domNode)
  let target = e.target
  while (target !== limit) {
    if (componentsNode.includes(target)) { return }
    target = target.parentNode
  }
  locker.unlock()
}
