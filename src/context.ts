import * as core from "@actions/core";
import * as io from "@actions/io";
import * as path from "path";
import * as fs from "fs";
import { URL } from "url";

export async function setKubernetesContext(
  oidcUrl: URL,
  token: string,
  oidcUsername: string,
  k8sUrl: string,
  k8sNamespace: string,
  k8sSkipTlsVerify: boolean,
) {
  const runnerTempDirectory = process.env.RUNNER_TEMP || "/tmp/";
  const dirPath = path.join(runnerTempDirectory, `kube_config_${Date.now()}`);
  await io.mkdirP(dirPath);
  const kubeConfigPath = path.join(dirPath, "custom-config");

  core.debug(`Writing kube config contents to ${kubeConfigPath}`);
  const config = {
    apiVersion: "v1",
    kind: "Config",
    clusters: [
      {
        name: "default-cluster",
        cluster: {
          "insecure-skip-tls-verify": k8sSkipTlsVerify,
          server: k8sUrl,
        },
      },
    ],
    users: [
      {
        name: "default-user",
        user: {
          "auth-provider": {
            config: {
              "client-id": oidcUsername,
              "id-token": token,
              "idp-issuer-url": oidcUrl.origin,
            },
            name: "oidc",
          },
        },
      },
    ],
    contexts: [
      {
        context: {
          cluster: "default-cluster",
          namespace: k8sNamespace,
          user: "default-user",
        },
        name: "default-context",
      },
    ],
    "current-context": "default-context",
  };

  fs.writeFileSync(kubeConfigPath, JSON.stringify(config));
  core.info("kubectl config save");

  core.exportVariable("KUBECONFIG", kubeConfigPath);
  core.info("KUBECONFIG environment variable is set");
}
