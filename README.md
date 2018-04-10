# Pi Sensor

## Description

This is a brief guide on how to use my custom generic sensor board on Raspberry Pi using MCP3008, I2C and 1-wire connections.

## Prerequisites

* Configure Raspberry Pi basics via `sudo raspi-config` (you'll need a monitor and a keyboard pluged to your Raspberry Pi)
  * Default pi password
  * keyboard layout
  * Wireless network
  * Enable interfaces in `Interfacing Options` like SSH, 1-wire, spi, i2c...
* Install software
  * `sudo apt-get upgrade`
  * `sudo apt-get update`
  * `sudo apt-get install vim mongodb python-pymongo python3-pymongo build-essential python-dev python-smbus python-pymongo python-pip git`
* Install nodejs 8
  * `curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`
  * `sudo apt-get install nodejs`
* Install third party tools for GPIO

```console
cd ~
git clone https://github.com/adafruit/Adafruit_Python_MCP3008.git
cd Adafruit_Python_MCP3008
sudo python setup.py install
cd ~
sudo pip install adafruit-mcp3008
cd ~
sudo pip install w1thermsensor
```

* Install pisensor project
  * `cd ~ && git clone https://github.com/jotajotaramirez/pisensor.git`
  * Make sure /home/pi/pisensor/update.py has exec permissions by running `chmod +x /home/pi/pisensor/update.py`
  * Edit crontab by adding `* * * * * /home/pi/pisensor/update.py` if you want to update sensor values each minute

* To backup db

Consider to add the following command to your crontab as described before:

```console
mkdir -p /home/pi/backups \
  && cd /home/pi/backups \
  && mongodump \
  && tar -czf "/home/pi/backups/sensor.$(date '+%F_%H%M%S').tar.gz" dump`
```

## Configure services

* Start mongo when raspberry starts: `sudo service mongod start`
