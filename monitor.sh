#!/bin/bash

export NODE_ENV=production

cd /home/pi/pisensor \
  && curl localhost \
  || sudo npm start