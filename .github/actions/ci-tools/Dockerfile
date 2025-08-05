FROM ubuntu:22.04

ARG YQ_VERSION=4.47.1
ARG SHELLCHECK_VERSION=0.11.0
ARG HADOLINT_VERSION=2.12.0

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# hadolint ignore=DL3008
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    xz-utils \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sSL https://github.com/mikefarah/yq/releases/download/v${YQ_VERSION}/yq_linux_amd64 -o /usr/local/bin/yq \
    && chmod +x /usr/local/bin/yq

RUN curl -sSL https://github.com/koalaman/shellcheck/releases/download/v${SHELLCHECK_VERSION}/shellcheck-v${SHELLCHECK_VERSION}.linux.x86_64.tar.xz \
    | tar -xJ && \
    mv shellcheck-v${SHELLCHECK_VERSION}/shellcheck /usr/local/bin/shellcheck && \
    chmod +x /usr/local/bin/shellcheck && \
    rm -rf shellcheck-v${SHELLCHECK_VERSION}

RUN curl -sSL https://github.com/hadolint/hadolint/releases/download/v${HADOLINT_VERSION}/hadolint-Linux-x86_64 -o /usr/local/bin/hadolint \
    && chmod +x /usr/local/bin/hadolint

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
