import * as core from '@actions/core'
import fetch from 'node-fetch';
import base64 from 'base-64';

export async function getOIDCToken(oidc_url: string, oidc_username: string, oidc_password: string) {
  let token = ''
  try {
    await fetch(`${oidc_url}&client_id=${oidc_username}`, {
      method: 'POST',
      timeout: 10000,
      headers: { 
        Authorization: 'Basic ' + base64.encode(oidc_username + ':' + oidc_password),
        'Content-Type': 'application/x-www-form-urlencoded' }
    })
      .then(res => res.json())
      .then(res => { token = res.access_token || '' })
  } catch (error) {
    console.log(`Cannot get OIDC token`)
    core.setFailed(error.message)
  }

  return token
}