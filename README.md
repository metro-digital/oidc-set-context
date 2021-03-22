# Set kubectl context using OIDC authorization

The action to setup kubectl context using OIDC authorization. To provide OIDC token it will make request to this provider.

## Inputs

### `oidc_url`

**Required** Url to get token from OIDC provider.

### `oidc_username`

**Required** Username to OIDC provider.

### `oidc_password`

**Required** Password to OIDC provider.

### `k8s_url`

**Required** Cluster url.

### `k8s_namespace`

Cluster namespace. Default value `default`.

### `k8s_skip_tls_verify`

Cluster skip tls verification. Default value `true`.

## Outputs


## Example usage

```yaml
uses: metro-digital/oid-set-context@v0.x
with:
    oidc_url: ${{ secrets.OIDC_URL }}
    oidc_username: ${{ secrets.TU_ID }}
    oidc_password: ${{ secrets.TU_SECRET }}
    k8s_url: ${{ secrets.CLUSTER_URL }}
```