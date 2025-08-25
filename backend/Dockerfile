FROM ghcr.io/userver-framework/ubuntu-22.04-userver:latest

COPY . /home/user/.local/etc/scenariosus

WORKDIR /home/user/.local/etc/scenariosus

ENV PREFIX=/root/.local \
    CCACHE_DIR=/scenariosus/.ccache \
    CORES_DIR=/cores

RUN make build-release

RUN mkdir app && \
    cp -r configs/* . && \
    cp build_release/scenariosus app/ && \
    sed -i 's/config_vars.yaml/config_vars.docker.yaml/g' static_config.yaml

WORKDIR /home/user/.local/etc/scenariosus/app

ENTRYPOINT ["./scenariosus"]
CMD ["--config", "../static_config.yaml"]