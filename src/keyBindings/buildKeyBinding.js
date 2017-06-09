import { uncurry, until, iterApply, pipeline } from '../higherOrderFns'

const notVoid = x => (x !== null && x !== undefined)

// BlockTypes: string
// GetBlockTypes: _ -> [BlockTypes]
// String*:: string U {undefined}
//
// [GetBlockTypes -> Event -> ES -> String U {undefined}]
// -> GetBlockTypes ->
// (Event, ES) -> String U {undefined}
export default bindings => getBlockTypes => uncurry(
  // Event -> ES -> String*
  pipeline(
    // Event -> [ES -> String*]
    iterApply(
      // [Event -> ES -> String*]
      bindings.map(b => b(getBlockTypes)),
    ),
    // [a -> b] -> a -> b
    until(notVoid),
  ),
)
