import * as core from '@actions/core'
import * as context from './context'
import * as oidc from './oidc'
import { URL } from 'url'

export async function run (): Promise<void> {
  try {
    const oidcUrlString = core.getInput('oidc_url')
    if (!oidcUrlString) {
      throw new Error('OIDC url cannot be empty')
    }
    const oidcUrl = new URL(oidcUrlString)

    const oidcUsername = core.getInput('oidc_username')
    if (!oidcUsername) {
      throw new Error('OIDC username cannot be empty')
    }

    const oidcPassword = core.getInput('oidc_password')
    if (!oidcPassword) {
      throw new Error('OIDC password cannot be empty')
    }

    const k8sUrl = core.getInput('k8s_url')
    if (!k8sUrl) {
      throw new Error('k8s url cannot be empty')
    }

    const k8sNamespace = core.getInput('k8s_namespace')
    if (!k8sNamespace) {
      throw new Error('k8s namespace cannot be empty')
    }

    const k8sSkipTlsVerify = (core.getInput('k8s_skip_tls_verify') === 'true')

    core.debug(`Given input\n\toidc_url: ${oidcUrl}\n\toidc_username: ${oidcUsername}\n\toidc_password: ${oidcPassword}
    \tk8s_url: ${k8sUrl}\n\tk8s_namespace: ${k8sNamespace}\n\tk8s_skip_tls_verify: ${k8sSkipTlsVerify}`)

    const token = await oidc.getOIDCToken(oidcUrl, oidcUsername, oidcPassword)
    await context.setKubernetesContext(oidcUrl, token, oidcUsername, k8sUrl, k8sNamespace, k8sSkipTlsVerify)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run().catch(core.setFailed)
