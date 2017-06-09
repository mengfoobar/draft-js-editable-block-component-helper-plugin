import build from './buildKeyBinding'
import enterCmd, { specialBindings } from './enterBlock'
import removeCmd from './removeBlock'

export default build([enterCmd, removeCmd])
export { specialBindings }
