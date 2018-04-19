#!/bin/bash

chmod +x update.py

apt-get -y upgrade
apt-get -y update
apt-get -y install vim mongodb python-pymongo python3-pymongo build-essential python-dev python-smbus python-pymongo python-pip git i2c-tools
curl -sL https://deb.nodesource.com/setup_8.x | bash -
apt-get -y install nodejs

npm install

service mongod start

cd /tmp
git clone https://github.com/adafruit/Adafruit_Python_MCP3008.git
cd Adafruit_Python_MCP3008
python setup.py install
cd /tmp
git clone https://github.com/adafruit/Adafruit_Python_DHT
cd Adafruit_Python_DHT
python setup.py install
cd /tmp
pip install adafruit-mcp3008
cd /tmp
pip install w1thermsensor