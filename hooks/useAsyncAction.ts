'use client'

import { useCallback, useRef, useState } from 'react'

type AnyFn<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>

interface UseAsyncActionController<TResult> {
  setPending: (value: boolean) => void
  setError: (error: unknown) => void
  setResult?: (result: TResult | undefined) => void
}

interface UseAsyncActionOptions<TResult> {
  onSuccess?: (result: TResult) => void
  onError?: (error: unknown) => void
  rethrow?: boolean
  controller?: UseAsyncActionController<TResult>
}

interface UseAsyncActionResult<TArgs extends unknown[], TResult> {
  execute: (...args: TArgs) => Promise<TResult | undefined>
  isLoading: boolean
  error: unknown
  reset: () => void
}

export function useAsyncAction<TArgs extends unknown[], TResult>(
  action: AnyFn<TArgs, TResult>,
  options: UseAsyncActionOptions<TResult> = {}
): UseAsyncActionResult<TArgs, TResult> {
  const { onSuccess, onError, rethrow = true, controller } = options
  const [internalLoading, setInternalLoading] = useState(false)
  const [internalError, setInternalError] = useState<unknown>(null)
  const callRef = useRef(0)

  const setLoading = controller?.setPending ?? setInternalLoading
  const setError = controller?.setError ?? setInternalError
  const setResult = controller?.setResult

  const isLoading = controller ? undefined : internalLoading
  const error = controller ? undefined : internalError

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      const callId = ++callRef.current
      setLoading(true)
      setError(null)

      try {
        const result = await action(...args)
        if (callId === callRef.current) {
          onSuccess?.(result)
          setResult?.(result)
        }
        return result
      } catch (err) {
        if (callId === callRef.current) {
          setError(err)
          onError?.(err)
          setResult?.(undefined)
        }
        if (rethrow) {
          throw err
        }
        return undefined
      } finally {
        if (callId === callRef.current) {
          setLoading(false)
        }
      }
    },
    [action, onError, onSuccess, rethrow, setError, setLoading, setResult]
  )

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setResult?.(undefined)
    callRef.current += 1
  }, [setError, setLoading, setResult])

  return {
    execute,
    isLoading: isLoading ?? false,
    error: error ?? null,
    reset,
  }
}

export type {
  UseAsyncActionOptions,
  UseAsyncActionResult,
  UseAsyncActionController,
}

