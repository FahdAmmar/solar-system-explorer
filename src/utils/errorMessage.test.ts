import { describe, expect, it } from 'vitest'
import { ApiError } from '@/services/api'
import { getUserErrorMessage } from './errorMessage'

describe('getUserErrorMessage', () => {
  it.each([
    [new ApiError('timeout', 'x'), 'took too long'],
    [new ApiError('network', 'x'), 'could not reach the server'],
    [new ApiError('invalid-data', 'x'), 'could not read'],
    [new ApiError('http', 'x', { status: 404 }), 'could not be found'],
    [new ApiError('http', 'x', { status: 500 }), 'ran into a problem'],
    [new Error('boom'), 'unexpected'],
    ['a string', 'unexpected'],
  ])('describes %s', (error, fragment) => {
    expect(getUserErrorMessage(error)).toContain(fragment)
  })

  it('never exposes technical details', () => {
    const error = new ApiError('http', 'secret stack /srv/app/db.js:42', { status: 500 })
    expect(getUserErrorMessage(error)).not.toMatch(/secret|db\.js|500/)
  })
})
