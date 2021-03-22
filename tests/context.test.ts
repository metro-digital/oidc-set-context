import * as io from '@actions/io'
import { promises as fs } from 'fs'
import * as path from 'path'
import * as context from '../src/context'

Date.now = jest.fn(() => 1616422647068)
const tempDir = path.join(__dirname, 'runner', 'temp')
process.env.RUNNER_TEMP = tempDir

describe('context tests', () => {
  beforeAll(async () => {
    await io.rmRF(tempDir)
  })

  afterAll(async () => {
    await io.rmRF(tempDir)
  })

  const oidcUrl = new URL('https://example.com/a/b/c?a=1')
  const token = 'mytoken'
  const oidcUsername = 'username'
  const k8sUrl = 'https://api.example.com'
  const k8sNamespace = 'my-namespace'
  const k8sSkipTlsVerify = true
  it('Generate kube config', async () => {
    process.env.KUBECONFIG = 'prev-config'
    await context.setKubernetesContext(oidcUrl, token, oidcUsername, k8sUrl, k8sNamespace, k8sSkipTlsVerify)

    expect(process.env.KUBECONFIG).toBe(path.join(tempDir, 'kube_config_1616422647068/custom-config'))

    const kubeConfig = JSON.parse(await fs.readFile(process.env.KUBECONFIG, { encoding: 'utf8' }))
    expect(kubeConfig.clusters[0].cluster.server).toBe(k8sUrl)
    expect(kubeConfig.clusters[0].cluster['insecure-skip-tls-verify']).toBe(k8sSkipTlsVerify)
    expect(kubeConfig.users[0].user['auth-provider'].config['client-id']).toBe(oidcUsername)
    expect(kubeConfig.users[0].user['auth-provider'].config['id-token']).toBe(token)
    expect(kubeConfig.users[0].user['auth-provider'].config['idp-issuer-url']).toBe(oidcUrl.origin)
    expect(kubeConfig.contexts[0].context.namespace).toBe(k8sNamespace)
    expect(kubeConfig).toStrictEqual(
      {
        apiVersion: 'v1',
        clusters: [{ cluster: { 'insecure-skip-tls-verify': true, server: 'https://api.example.com' }, name: 'default-cluster' }],
        contexts: [{
          context: { cluster: 'default-cluster', namespace: 'my-namespace', user: 'default-user' },
          name: 'default-context'
        }],
        'current-context': 'default-context',
        kind: 'Config',
        users: [{
          name: 'default-user',
          user: {
            'auth-provider': {
              config: { 'client-id': 'username', 'id-token': 'mytoken', 'idp-issuer-url': 'https://example.com' },
              name: 'oidc'
            }
          }
        }]
      })
  })
})
