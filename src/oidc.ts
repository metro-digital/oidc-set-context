import * as core from '@actions/core'
import fetch from 'node-fetch'
import base64 from 'base-64'
import { URL } from 'url'

export async function getOIDCToken (oidcUrl: URL, oidcUsername: string, oidcPassword: string) {
  console.log('OIDC get token')

  const newSearchParams = new URLSearchParams(oidcUrl.searchParams)
  newSearchParams.append('client_id', oidcUsername)

  const request = {
    method: 'POST',
    timeout: 10000,
    headers: {
      Authorization: 'Basic ' + base64.encode(oidcUsername + ':' + oidcPassword),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: newSearchParams
  }

  core.debug(`URL: ${oidcUrl.origin}${oidcUrl.pathname}`)
  core.debug(`Request:\n${request}`)
  const response = await fetch(`${oidcUrl.origin}${oidcUrl.pathname}`, request)
  const data = await response.json()

  core.debug(`Response\nstatus code: ${response.status}\nstatus text: "${response.statusText}"`)

  const token = data.access_token
  if (!token || !response.ok) {
    throw new Error(`OIDC request fail - response\nstatus code: ${response.status}\nstatus text: "${response.statusText}"`)
  }

  console.log('OIDC token receive')
  return token
}
