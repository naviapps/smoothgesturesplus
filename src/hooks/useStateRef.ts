import { Dispatch, MutableRefObject, SetStateAction, useCallback, useRef, useState } from 'react'

function isFunction<S>(setStateAction: SetStateAction<S>): setStateAction is (prevState: S) => S {
  return typeof setStateAction === 'function'
}

function useStateRef<S>(
  initialState: S | (() => S),
): [S, Dispatch<SetStateAction<S>>, MutableRefObject<S>] {
  const [state, setState] = useState<S>(initialState)
  const ref: MutableRefObject<S> = useRef<S>(state)

  const handler: Dispatch<SetStateAction<S>> = useCallback((setStateAction: SetStateAction<S>) => {
    ref.current = isFunction(setStateAction) ? setStateAction(ref.current) : setStateAction

    setState(ref.current)
  }, [])

  return [state, handler, ref]
}

export default useStateRef
