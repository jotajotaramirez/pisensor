# Pi Sensor

## Description

This is a brief guide on how to use my custom generic sensor board on Raspberry Pi using MCP3008, I2C and 1-wire connections.

## Prerequisites

Configure Raspberry Pi basics via `sudo raspi-config` (you'll need a monitor and a keyboard pluged to your Raspberry Pi):

* Change default pi password
* Setup keyboard layout
* Setup Wireless network if needed
* Enable interfaces in `Interfacing Options` like SSH, 1-wire, spi, i2c...

## Automatic installation

Just run `sudo install.sh`

## Manual installation

* Install software
  * `sudo apt-get upgrade`
  * `sudo apt-get update`
  * `sudo apt-get install vim mongodb python-pymongo python3-pymongo build-essential python-dev python-smbus python-pymongo python-pip git i2c-tools`
* Install nodejs 8
  * `curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`
  * `sudo apt-get install nodejs`
* Start mongo when raspberry starts: `sudo service mongod start`
* Install third party tools for GPIO

```bash
cd /tmp
git clone https://github.com/adafruit/Adafruit_Python_MCP3008.git
cd Adafruit_Python_MCP3008
sudo python setup.py install
cd /tmp
git clone https://github.com/adafruit/Adafruit_Python_DHT
cd Adafruit_Python_DHT
sudo python setup.py install
cd /tmp
pip install adafruit-mcp3008
cd /tmp
pip install w1thermsensor
```

## Store sensor data each minute

* Make sure /home/pi/pisensor/update.py has exec permissions by running `chmod +x update.py`
* Edit crontab by adding `* * * * * /home/pi/pisensor/update.py`. Changes these values if you want to use a different schedule.

## Automatically backup data

Consider to add the following command to your crontab as described before to backup your data periodically. It's also recommended to move backups outside raspberry pi:

```bash
mkdir -p /home/pi/backups \
  && cd /home/pi/backups \
  && mongodump \
  && tar -czf "/home/pi/backups/sensor.$(date '+%F_%H%M%S').tar.gz" dump`
```
