import * as os from "os"
import * as core from "@actions/core"
import * as context from "./context"
import * as oidc from "./oidc"

export async function run(): Promise<void> {
  try {
    if (os.platform() !== "linux") {
      throw new Error("Only supported on linux platform")
    }

    const oidc_url = core.getInput("oidc_url")
    if (!oidc_url) {
      core.setFailed("OIDC url cannot be empty")
      return
    }

    const oidc_username = core.getInput("oidc_username")
    if (!oidc_username) {
      core.setFailed("OIDC username cannot be empty")
      return
    }

    const oidc_password = core.getInput("oidc_username")
    if (!oidc_password) {
      core.setFailed("OIDC username cannot be empty")
      return
    }

    const k8s_url = core.getInput("k8s_url")
    if (!k8s_url) {
      core.setFailed("OIDC username cannot be empty")
      return
    }

    let k8s_namespace = core.getInput("k8s_namespace")
    if (!k8s_namespace) {
      k8s_namespace = "default"
    }

    let k8s_skip_tls_verify = core.getInput("k8s_skip_tls_verify")
    if (!k8s_skip_tls_verify) {
      k8s_skip_tls_verify = "true"
    }
    core.debug(`Given input\n\toidc_url: ${oidc_url}\n\toidc_username: ${oidc_username}\n\toidc_password: ${oidc_password}
    \tk8s_url: ${k8s_url}\n\tk8s_namespace: ${k8s_namespace}\n\tk8s_skip_tls_verify: ${k8s_skip_tls_verify}`)

    const token = await oidc.getOIDCToken(oidc_url, oidc_username, oidc_password)
    context.setKubernetesContext(oidc_url, token, oidc_username,k8s_url, k8s_namespace, k8s_skip_tls_verify)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run().catch(core.setFailed)
