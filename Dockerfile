FROM node
COPY server .
ENTRYPOINT [npm, start]