
import * as core from '@actions/core'
import * as io from '@actions/io'
import * as path from 'path'
import * as fs from 'fs'
import * as url from 'url'

export async function setKubernetesContext (oidcUrl: string, token: string, oidcUsername: string, k8sUrl: string, k8sNamespace: string, k8sSkipTlsVerify: string) {
  const runnerTempDirectory = process.env.RUNNER_TEMP || '/tmp/'
  const dirPath = path.join(runnerTempDirectory, `kube_config_${Date.now()}`)
  await io.mkdirP(dirPath)
  const kubeConfigPath = path.join(dirPath, 'custom-config')

  core.debug(`Writing kube config contents to ${kubeConfigPath}`)
  const oidcUrlParsed = new url.URL(oidcUrl)
  const config = {
    apiVersion: 'v1',
    kind: 'Config',
    clusters: [
      {
        name: 'default-cluster',
        cluster: {
          'insecure-skip-tls-verify': (k8sSkipTlsVerify.toLowerCase() === 'true'),
          server: oidcUrl
        }
      }
    ],
    users: [
      {
        name: 'default-user',
        user: {
          'auth-provider': {
            config: {
              'client-id': oidcUsername,
              'id-token': token,
              'idp-issuer-url': `${oidcUrlParsed.origin}`
            },
            name: 'oidc'
          }
        }
      }
    ],
    contexts: [
      {
        context: {
          cluster: 'default-cluster',
          namespace: k8sNamespace,
          user: 'default-user'
        },
        name: 'default-context'
      }
    ],
    'current-context': 'default-context'
  }

  fs.writeFileSync(kubeConfigPath, JSON.stringify(config))

  core.exportVariable('KUBECONFIG_BACKUP', process.env.KUBECONFIG)
  core.exportVariable('KUBECONFIG', dirPath)
  console.log('KUBECONFIG environment variable is set')
}
