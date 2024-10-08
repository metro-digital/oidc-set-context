import * as core from "@actions/core";
import type { URL } from "node:url";

export async function getOIDCToken(oidcUrl: URL, oidcUsername: string, oidcPassword: string) {
  core.info("OIDC get token");

  const newSearchParams = new URLSearchParams(oidcUrl.searchParams);
  newSearchParams.append("client_id", oidcUsername);

  const request = {
    method: "POST",
    timeout: 10000,
    headers: {
      Authorization: "Basic BASE64_AUTH",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: newSearchParams,
  };

  core.debug(`URL: ${oidcUrl.origin}${oidcUrl.pathname}`);
  core.debug(`Request: ${JSON.stringify(request, null, 2)}`);

  // biome-ignore lint/style/useTemplate: <explanation>
  request.headers.Authorization = "Basic " + Buffer.from(`${oidcUsername}:${oidcPassword}`, "ascii").toString("base64");
  const response = await fetch(`${oidcUrl.origin}${oidcUrl.pathname}`, request);
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const data = (await response.json()) as { [key: string]: any };

  core.debug(`Response
    status code: ${response.status}
    status text: "${response.statusText}"`);

  const token = data.access_token;
  if (!token || !response.ok) {
    throw new Error(`OIDC request fail - response
      status code: ${response.status}
      status text: "${response.statusText}"`);
  }

  core.setSecret(token);

  core.info("OIDC token receive");
  return token;
}
