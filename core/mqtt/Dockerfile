FROM hivemq/hivemq-ce

# download hivemq-deny-wildcard-extension
RUN cd ./extensions && \
    apt-get update && \
    apt-get install unzip && \
    curl -LO https://github.com/hivemq/hivemq-deny-wildcard-extension/releases/download/4.1.2/hivemq-deny-wildcard-extension-4.1.2.zip && \
    unzip hivemq-deny-wildcard-extension-4.1.2.zip
