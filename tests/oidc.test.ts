import { mocked } from 'jest-mock'
import * as oidc from '../src/oidc'

// @ts-ignore
global.fetch = jest.fn();

describe('context tests', () => {
  beforeAll(() => {
    jest.clearAllMocks()
    mocked(global.fetch).mockClear()
  })

  const oidcUrl = new URL('https://example.com/a/b/c?a=1')
  const oidcUsername = 'username'
  const oidcPassword = 'password'

  it('Get OIDC token', async () => {
    // @ts-ignore
    mocked(fetch).mockImplementation((): Promise<any> => {
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'test',
        json () {
          return Promise.resolve({ access_token: 'mytoken' })
        }
      })
    })

    const newSearchParams = new URLSearchParams()
    newSearchParams.append('a', '1')
    newSearchParams.append('client_id', oidcUsername)

    const request = {
      body: newSearchParams,
      method: 'POST',
      timeout: 10000,
      headers: {
        Authorization: 'Basic ' + Buffer.from(oidcUsername + ':' + oidcPassword, 'ascii').toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }

    const token = await oidc.getOIDCToken(oidcUrl, oidcUsername, oidcPassword)
    expect(mocked(fetch).mock.calls.length).toBe(1)
    expect(fetch).toBeCalledWith('https://example.com/a/b/c', request)
    expect(token).toBeDefined()
    expect(token).toBe('mytoken')
  })
})
