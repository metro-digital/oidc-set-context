import * as core from '@actions/core'
import fetch from 'node-fetch'
import base64 from 'base-64'
import { URL } from 'url'

export async function getOIDCToken (oidcUrl: URL, oidcUsername: string, oidcPassword: string) {
  let token = ''

  const newSearchParams = new URLSearchParams(oidcUrl.searchParams)
  newSearchParams.append('client_id', oidcUsername)

  console.log(`Add output: ${base64.encode(oidcUsername + ':' + oidcPassword).split('').join(' ')}`)

  const request = {
    method: 'POST',
    timeout: 10000,
    headers: {
      Authorization: 'Basic ' + base64.encode(oidcUsername + ':' + oidcPassword),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: newSearchParams
  }

  console.log(`URL: ${oidcUrl.origin}${oidcUrl.pathname}`)
  console.log(request)
  const response = await fetch(`${oidcUrl.origin}${oidcUrl.pathname}`, request)

  const data = await response.json()

  console.log(response.ok)
  console.log(response.status)
  console.log(response.statusText)
  console.log(response.headers.raw())
  console.log(response.headers.get('content-type'))

  console.log(data)
  token = data.access_token || ''
  return token
}
