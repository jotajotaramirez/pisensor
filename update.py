#!/usr/bin/python

# Run `crontab -e` and add the following to run this each minute
# * * * * * /home/pi/test.py

import pymongo
from pymongo import MongoClient
from datetime import datetime
import time

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



client = MongoClient('mongodb://localhost:27017/')
db = client['sensor']
collection = db['data']

document = { "date": datetime.now() }

document.update(read_mcp())
time.sleep(0.5)

# Save all data
collection.insert(document)
client.close()
