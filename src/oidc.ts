import * as core from '@actions/core'
import fetch from 'node-fetch'
import base64 from 'base-64'

export async function getOIDCToken (oidcUrl: string, oidcUsername: string, oidcPassword: string) {
  let token = ''
  try {
    await fetch(`${oidcUrl}&client_id=${oidcUsername}`, {
      method: 'POST',
      timeout: 10000,
      headers: {
        Authorization: 'Basic ' + base64.encode(oidcUsername + ':' + oidcPassword),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then(res => res.json())
      .then(res => { token = res.access_token || '' })
  } catch (error) {
    console.log('Cannot get OIDC token')
    core.setFailed(error.message)
  }

  return token
}
