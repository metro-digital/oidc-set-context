import * as os from 'os'
import * as core from '@actions/core'
import * as context from './context'
import * as oidc from './oidc'

export async function run (): Promise<void> {
  try {
    if (os.platform() !== 'linux') {
      throw new Error('Only supported on linux platform')
    }

    const oidcUrl = core.getInput('oidc_url')
    if (!oidcUrl) {
      core.setFailed('OIDC url cannot be empty')
      return
    }

    const oidcUsername = core.getInput('oidc_username')
    if (!oidcUsername) {
      core.setFailed('OIDC username cannot be empty')
      return
    }

    const oidcPassword = core.getInput('oidc_username')
    if (!oidcPassword) {
      core.setFailed('OIDC password cannot be empty')
      return
    }

    const k8sUrl = core.getInput('k8s_url')
    if (!k8sUrl) {
      core.setFailed('k8s url cannot be empty')
      return
    }

    let k8sNamespace = core.getInput('k8s_namespace')
    if (!k8sNamespace) {
      k8sNamespace = 'default'
    }

    let k8sSkipTlsVerify = core.getInput('k8s_skip_tls_verify')
    if (!k8sSkipTlsVerify) {
      k8sSkipTlsVerify = 'true'
    }
    core.debug(`Given input\n\toidc_url: ${oidcUrl}\n\toidc_username: ${oidcUsername}\n\toidc_password: ${oidcPassword}
    \tk8s_url: ${k8sUrl}\n\tk8s_namespace: ${k8sNamespace}\n\tk8s_skip_tls_verify: ${k8sSkipTlsVerify}`)

    const token = await oidc.getOIDCToken(oidcUrl, oidcUsername, oidcPassword)
    context.setKubernetesContext(oidcUrl, token, oidcUsername, k8sUrl, k8sNamespace, k8sSkipTlsVerify)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run().catch(core.setFailed)
