import * as core from '@actions/core'
import fetch from 'node-fetch'
import base64 from 'base-64'
import { URL } from 'url'

export async function getOIDCToken (oidcUrl: URL, oidcUsername: string, oidcPassword: string) {
  core.info('OIDC get token')

  const newSearchParams = new URLSearchParams(oidcUrl.searchParams)
  newSearchParams.append('client_id', oidcUsername)

  const request = {
    method: 'POST',
    timeout: 10000,
    headers: {
      Authorization: 'Basic BASE64_AUTH',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: newSearchParams
  }

  core.debug(`URL: ${oidcUrl.origin}${oidcUrl.pathname}`)
  core.debug(`Request:
    ${request}`)

  request.headers.Authorization = 'Basic ' + base64.encode(oidcUsername + ':' + oidcPassword)
  const response = await fetch(`${oidcUrl.origin}${oidcUrl.pathname}`, request)
  const data = await response.json()

  core.debug(`Response
    status code: ${response.status}
    status text: "${response.statusText}"`)

  const token = data.access_token
  if (!token || !response.ok) {
    throw new Error(`OIDC request fail - response
      status code: ${response.status}
      status text: "${response.statusText}"`)
  }

  core.info('OIDC token receive')
  return token
}
