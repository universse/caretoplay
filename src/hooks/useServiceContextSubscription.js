import { useEffect } from 'react'

import useConstant from './useConstant'

export default function useServiceContextSubscription(service, listener) {
  const [serviceRef, listenerRef] = useConstant([service, listener])

  useEffect(() => {
    // maybe detect change
    serviceRef.onChange(listenerRef)

    return () => {
      serviceRef.off(listenerRef)
    }
  }, [])
}
