
import * as core from '@actions/core'
import * as io from '@actions/io'
import * as path from 'path'
import * as fs from 'fs'
import * as url from 'url'

export async function setKubernetesContext(oidc_url: string, token: string, oidc_username: string, k8s_url: string, k8s_namespace: string, k8s_skip_tls_verify: string) {

  const runnerTempDirectory = process.env['RUNNER_TEMP'] || '/tmp/'
  const dirPath = path.join(runnerTempDirectory, `kube_config_${Date.now()}`)
  await io.mkdirP(dirPath)
  const kubeConfigPath = path.join(dirPath, `custom-config`)

  core.debug(`Writing kube config contents to ${kubeConfigPath}`)
  const oidcUrlParsed = url.parse(oidc_url)
  const config = {
    "apiVersion": "v1",
    "kind": "Config",
    "clusters": [
      {
        "name": "default-cluster",
        "cluster": {
          "insecure-skip-tls-verify": (k8s_skip_tls_verify.toLowerCase() == 'true'),
          "server": oidc_url
        }
      }
    ],
    "users": [
      {
        "name": "default-user",
        "user": {
          "auth-provider": {
            "config": {
              "client-id": oidc_username,
              "id-token": token,
              "idp-issuer-url": `${oidcUrlParsed.protocol}//${oidcUrlParsed.host}`
            },
            "name": "oidc"
          }
        }
      }
    ],
    "contexts": [
      {
        "context": {
          "cluster": "default-cluster",
          "namespace": k8s_namespace,
          "user": "default-user"
        },
        "name": "default-context"
      }
    ],
    "current-context": "default-context",
  }

  fs.writeFileSync(kubeConfigPath, JSON.stringify(config))

  core.exportVariable('KUBECONFIG_BACKUP', process.env['KUBECONFIG'])
  core.exportVariable('KUBECONFIG', dirPath)
  console.log('KUBECONFIG environment variable is set')
}