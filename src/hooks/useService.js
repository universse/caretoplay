import { useState, useRef } from 'react'
// import { EventObject, Interpreter, Typestate } from "xstate";

import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect'

export default function useService(service) {
  const [state, setState] = useState(service.state)

  const serviceRef = useRef()

  useIsomorphicLayoutEffect(() => {
    serviceRef.current = service
  })

  useIsomorphicLayoutEffect(
    () => serviceRef.current.subscribe(setState).unsubscribe,
    []
  )

  return state
}
