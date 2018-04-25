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

Clone project (you may need to install git first by running `sudo apt-get install git`).

Then run
```bash
cd pisensor \
  && chmod +x install.sh \
  && sudo ./install.sh
```

## Manual installation

* Install software
  * `sudo apt-get upgrade`
  * `sudo apt-get update`
  * `sudo apt-get install vim mongodb python-pymongo python3-pymongo build-essential python-dev python-smbus python-pymongo python-pip git i2c-tools`
* Install nodejs 8
  * `curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`
  * `sudo apt-get install nodejs`
* Install node dependencies
  * `npm install`
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

## Automatically start everything

Make sure `/home/pi/pisensor/update.py` and `/home/pi/pisensor/monitor.sh` have exec permissions by running `chmod +x update.py` and `chmod +x monitor.sh`.
Edit crontab by running `crontab -e` and adding this line with your favourite text editor:

```crontab

* * * * * /home/pi/pisensor/update.py
*/5 * * * * /home/pi/pisensor/monitor.sh

```

Changes these values if you want to use a different schedule. This will update sensors data every minute and will check that node server is up every 5 minutes (if it's down the script will try to start node).

## Automatically backup data

Consider to add the following command to your crontab as described before to backup your data periodically. It's also recommended to move backups outside raspberry pi:

```bash
mkdir -p /home/pi/backups \
  && cd /home/pi/backups \
  && mongodump \
  && tar -czf "/home/pi/backups/sensor.$(date '+%F_%H%M%S').tar.gz" dump
```

## OpenVPN

If you're using a 3G dongle then you will need to be connected to a VPN in order to access this server as, usually, 3G cards offers internet under a global NAT that means that you can't access directly your server as it's using a private IP address.
You can use OpenVPN as I've found it's the easiest way to do this. If you're using a QNAP NAS as a OpenVPN server then it's even easier, as the only thing you need to do is the following:

* Install OpenVPN on the raspberry by running `sudo apt-get install openvpn`
* Go to your QNAP NAS QVPN service, configure OpenVPN, grant privileges to one of your local users to OpenVPN and download the certificate file.
* Copy that certificate file to `/etc/openvpn/YOURSERVER.conf` (you can do this using `scp YOURSERVER.ovpn pi@YOURRASPBERRYPIADDRESS:/etc/openvpn/YOURSERVER.conf`)
* Create a new file login.cred and place on it the OpenVPN user name in the first line and the password in the second line. For example:

```

pi
openVPNPassword

```

* edit `/etc/openvpn/YOURSERVER.conf` and specify where is your username/pass file by adding:

```

auth-user-pass login.cred

```

* Make OpenVPN start at boot by uncommenting the following line from `/etc/default/openvpn`: `AUTOSTART="all"`

After that you can access sensor page by running a nginx server on your NAS that will redirect all requests to your PiSensor server through VPN. For example, using nginx:

docker run --rm --name pisensor-nginx -d --net=host -v /path/to/your/pisensor_nginx.conf:/etc/nginx/conf.d/default.conf:ro nginx

Your pisensor_nginx.conf may be something like this:

```conf
user  nginx;
worker_processes  1;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    server {
      listen 8888;

      location / {
            proxy_pass http://10.8.0.10/;
      }
    }

    #include /etc/nginx/conf.d/*.conf;
}
```

## Acknowledgements

Adafruit tutorials:

* https://learn.adafruit.com/dht/using-a-dhtxx-sensor
* https://learn.adafruit.com/raspberry-pi-analog-to-digital-converters/mcp3008
* https://learn.adafruit.com/adafruits-raspberry-pi-lesson-11-ds18b20-temperature-sensing/overview

Raspberry Spy tutorials:

* https://www.raspberrypi-spy.co.uk/2015/03/bh1750fvi-i2c-digital-light-intensity-sensor/