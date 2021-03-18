import * as core from '@actions/core'
import fetch from 'node-fetch'
import base64 from 'base-64'
import { URL } from 'url'

export async function getOIDCToken (oidcUrl: URL, oidcUsername: string, oidcPassword: string) {
  let token = ''
  const newSearchParams = new URLSearchParams(oidcUrl.searchParams)
  newSearchParams.append('client_id', oidcUsername)

  try {
    await fetch(`${oidcUrl.origin}${oidcUrl.pathname}&client_id=${oidcUsername}`, {
      method: 'POST',
      timeout: 10000,
      headers: {
        Authorization: 'Basic ' + base64.encode(oidcUsername + ':' + oidcPassword),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: newSearchParams
    })
      .then(res => {
        core.debug(`OIDC status code: ${res.status}, ${res.json()}`)
        return res.json()
      })
      .then(res => { token = res.access_token || '' })
  } catch (error) {
    console.log('Cannot get OIDC token')
    core.setFailed(error.message)
  }

  return token
}
