# Deployment Guide: Portfolio to Hetzner VPS

This guide details the steps to deploy your Angular portfolio to your Hetzner VPS using the configured GitHub Actions pipeline and Traefik.

## 1. Prerequisites on VPS

Ensure your VPS is ready to receive the deployment.

1. **SSH into your VPS**:

    ```bash
    ssh user@your-vps-ip
    ```

2. **Create the Deployment Directory**:
    The pipeline expects this exact path:

    ```bash
    sudo mkdir -p /opt/infrastructure/stacks/my-portfolio
    sudo chown -R $USER:$USER /opt/infrastructure/stacks/my-portfolio
    ```

3. **Verify Proxy Network**:
    Your Traefik stack uses `proxy-network`. Ensure it exists:

    ```bash
    docker network ls
    # If not found, create it (or use the one defined in your Traefik compose):
    docker network create proxy-network
    ```

4. **Docker Permissions**:
    Ensure your user can run docker commands without sudo:

    ```bash
    sudo usermod -aG docker $USER
    # Log out and log back in for this to take effect!
    ```

## 2. GitHub Secrets Configuration

You need to add the following secrets to your GitHub Repository to allow the pipeline to build and deploy.

**Go to**: GitHub Repo Settings -> Secrets and variables -> Actions -> **New repository secret**

| Secret Name | Value Description | Where to find it |
| :--- | :--- | :--- |
| `DOCKER_USERNAME` | Your Docker Hub Username | [Docker Hub](https://hub.docker.com/) -> Account Settings |
| `DOCKER_PASSWORD` | Docker Hub Access Token | Docker Hub -> Account Settings -> Security -> **New Access Token** (Read/Write/Delete) |
| `SSH_HOST` | Your VPS IP Address | Hetzner Cloud Console |
| `SSH_USER` | The username you SSH with | Usually `root` or your custom user (e.g., `adam`) |
| `SSH_KEY` | Your private SSH Key | The contents of your local private key file (e.g., `~/.ssh/id_rsa`).<br>**Important**: Must be in **PEM format** (starts with `-----BEGIN RSA PRIVATE KEY-----`).<br>If using OpenSSH format (starts with `BEGIN OPENSSH`), convert it: `ssh-keygen -p -m PEM -f ~/.ssh/id_rsa` |

## 3. Deployment Flow

Once the secrets are set:

1. **Push to Master**: Any push to the `master` branch will trigger the pipeline.
2. **Build**: GitHub Actions acts as the build server. It builds the Docker image and pushes it to your Docker Hub repository(`cavydev/my-portfolio`).
3. **Deploy**: The action logs into your VPS, pulls the new image, and restarts the container using the configuration in `docker-compose.yml`.

## 4. Traefik Configuration

The `docker-compose.yml` is already configured with labels to auto-register with your Traefik instance:

- **URL**: `https://portfolio.cavydev.com`
- **TLS**: Auto-managed by Traefik (using `myresolver`).
- **Network**: Connects internally via `proxy-network`.

No manual Nginx configuration is needed on the VPS side!
