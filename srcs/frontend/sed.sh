#!/bin/sh
sed -i "s/.*HOST_NAME.*/  HOST_NAME: '$IP_HOST',/" ./src/environments/environment.ts
sed -i "s/.*HOST_PORT.*/  HOST_PORT: '$PORT_HTTPS_HOST',/" ./src/environments/environment.ts
sed -i "s/.*IP_HOST.*/  IP_HOST: '$IP_HOST:$PORT_HTTPS_HOST',/" ./src/environments/environment.ts
sed -i "s/.*INTRA_UID.*/  INTRA_UID: '$INTRA_UID',/" ./src/environments/environment.ts
sed -i "s/.*HOST_NAME.*/  HOST_NAME: '$IP_HOST',/" ./src/environments/environment.prod.ts
sed -i "s/.*HOST_PORT.*/  HOST_PORT: '$PORT_HTTPS_HOST',/" ./src/environments/environment.prod.ts
sed -i "s/.*IP_HOST.*/  IP_HOST: '$IP_HOST:$PORT_HTTPS_HOST',/" ./src/environments/environment.prod.ts
sed -i "s/.*INTRA_UID.*/  INTRA_UID: '$INTRA_UID',/" ./src/environments/environment.prod.ts
