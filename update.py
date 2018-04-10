#!/usr/bin/python

# Run `crontab -e` and add the following to run this each minute
# * * * * * /home/pi/test.py

import pymongo
from pymongo import MongoClient
from datetime import datetime
import time

DHT22_PIN = 22
DEFAULT_READ_TIMEOUT = 0.5

# Reads MCP3008 values and return same input object with new fields
def read_mcp():
    import Adafruit_GPIO.SPI as SPI
    import Adafruit_MCP3008

    output = { }

    # Software SPI configuration:
    #CLK  = 18
    #MISO = 23
    #MOSI = 24
    #CS   = 25
    #mcp = Adafruit_MCP3008.MCP3008(clk=CLK, cs=CS, miso=MISO, mosi=MOSI)

    # Hardware SPI configuration:
    SPI_PORT   = 0
    SPI_DEVICE = 0
    mcp = Adafruit_MCP3008.MCP3008(spi=SPI.SpiDev(SPI_PORT, SPI_DEVICE))

    print('Reading MCP3008 values')
    for i in range(8):
        # The read_adc function will get the value of the specified channel (0-7).
        output['mcp_%d' % i] = mcp.read_adc(i)
    return output

def read_1wire_temperature():
    from w1thermsensor import W1ThermSensor

    sensor = W1ThermSensor()
    return { 'temp1w': sensor.get_temperature() }

def read_dht22(pin):
    import Adafruit_DHT

    humidity, temperature = Adafruit_DHT.read_retry(Adafruit_DHT.DHT22, pin)
    return { 'dht22_humidity': humidity, 'dht22_temperature': temperature }

def read_i2c_light():
    import smbus
    import time

    # Start measurement at 4lx resolution. Time typically 16ms.
    #CONTINUOUS_LOW_RES_MODE = 0x13
    # Start measurement at 1lx resolution. Time typically 120ms
    #CONTINUOUS_HIGH_RES_MODE_1 = 0x10
    # Start measurement at 0.5lx resolution. Time typically 120ms
    #CONTINUOUS_HIGH_RES_MODE_2 = 0x11
    # Start measurement at 1lx resolution. Time typically 120ms
    # Device is automatically set to Power Down after measurement.
    ONE_TIME_HIGH_RES_MODE_1 = 0x20
    # Start measurement at 0.5lx resolution. Time typically 120ms
    # Device is automatically set to Power Down after measurement.
    #ONE_TIME_HIGH_RES_MODE_2 = 0x21
    # Start measurement at 1lx resolution. Time typically 120ms
    # Device is automatically set to Power Down after measurement.
    #ONE_TIME_LOW_RES_MODE = 0x23

    #bus = smbus.SMBus(0) # Rev 1 Pi uses 0
    bus = smbus.SMBus(1)  # Rev 2 Pi uses 1
    BH1750 = 0x23 # Default device I2C address

    data = bus.read_i2c_block_data(BH1750, ONE_TIME_HIGH_RES_MODE_1)

    return { 'light': ((data[1] + (256 * data[0])) / 1.2) }

client = MongoClient('mongodb://localhost:27017/')
db = client['sensor']
collection = db['data']

document = { "date": datetime.now() }

# Read analog inputs from MCP3008
document.update(read_mcp())
time.sleep(DEFAULT_READ_TIMEOUT)

# Read 1-wire temperature sensor
document.update(read_1wire_temperature())
time.sleep(DEFAULT_READ_TIMEOUT)

# Read DHT22 humidity/temperature sensor
document.update(read_dht22(DHT22_PIN))
time.sleep(DEFAULT_READ_TIMEOUT)

# Read BH1750 i2c light sensor
document.update(read_i2c_light())
time.sleep(DEFAULT_READ_TIMEOUT)

# Save all data
collection.insert(document)
client.close()
