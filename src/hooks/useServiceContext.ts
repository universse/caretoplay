import { useState, useRef } from 'react'
import { EventObject, Interpreter, Typestate } from 'xstate'

import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect'

type Context = Record<string, any>
type ContextSelector<T extends Context, U> = (ctx: T) => U

const selectContext: ContextSelector<Context, any> = (ctx) => ctx

export default function useServiceContext<
  TContext,
  TContextSlice,
  TEvent extends EventObject,
  TTypestate extends Typestate<TContext> = any
>(
  service: Interpreter<TContext, any, TEvent, TTypestate>,
  selector: ContextSelector<TContext, TContextSlice> = selectContext
): TContextSlice {
  const [state, setState] = useState<TContextSlice>(() =>
    selector(service.state.context)
  )

  const serviceRef = useRef<Interpreter<TContext, any, TEvent, TTypestate>>()
  const selectorRef = useRef<ContextSelector<TContext, TContextSlice>>()

  useIsomorphicLayoutEffect(() => {
    serviceRef.current = service
    selectorRef.current = selector
  })

  useIsomorphicLayoutEffect(() => {
    const listener = (ctx: TContext) => {
      setState(
        (selectorRef.current as ContextSelector<TContext, TContextSlice>)(ctx)
      )
    }

    ;(serviceRef.current as Interpreter<
      TContext,
      any,
      TEvent,
      TTypestate
    >).onChange(listener)

    return () => {
      ;(serviceRef.current as Interpreter<
        TContext,
        any,
        TEvent,
        TTypestate
      >).off(listener)
    }
  }, [])

  return state
}
