import { assign } from 'xstate'
import { produce } from 'immer'

export function immerAssign(recipe) {
  return assign(produce(recipe))
}
