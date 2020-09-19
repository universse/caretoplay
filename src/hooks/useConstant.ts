import { useRef } from 'react'

export default function useConstant<T>(value: T) {
  const ref = useRef<T>()

  if (!ref.current) {
    ref.current = value
  }

  return ref.current
}
