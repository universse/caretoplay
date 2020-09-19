import React, {
  createContext,
  useCallback,
  useMemo,
  useContext,
  // @ts-ignore
  unstable_createMutableSource as createMutableSource,
  // @ts-ignore
  unstable_useMutableSource as useMutableSource,
} from 'react'
// import { EventObject, Interpreter, Typestate } from "xstate";

function getVersion(service) {
  return service.state.context
}

function subscribe(service, callback) {
  return service.subscribe(callback).unsubscribe
}

export default function createServiceContextStore(service) {
  const mutableSource = createMutableSource(service, getVersion)

  return function (selector) {
    const getSnapshot = useCallback(
      (service) => selector(service.state.context),
      [selector]
    )

    return useMutableSource(mutableSource, getSnapshot, subscribe)
  }
}
