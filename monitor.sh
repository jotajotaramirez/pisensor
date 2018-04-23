#!/bin/bash

cd /home/pi/pisensor \
  && curl localhost \
  || sudo npm start