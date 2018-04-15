module.exports = {
  light: {
    description: 'Sensor de luz',
    units: 'lux',
    max: 65535,
    inverse: false,
  },
  dht22_humidity: {
    description: 'Sensor de humedad',
    units: '%',
    max: 100,
    inverse: false,
  },
  dht22_temperature: {
    description: 'Sensor de temperatura interior',
    units: 'ºC',
    inverse: false,
  },
  temp1w: {
    description: 'Sensor de temperatura exterior',
    units: 'ºC',
    inverse: false,
  },
  mcp_0: {
    description: 'Sensor de humedad en tierra 1',
    units: '%',
    max: 1024,
    inverse: true,
  },
  mcp_1: {
    description: 'Sensor de humedad en tierra 2',
    units: '%',
    max: 1024,
    inverse: true,
  },
  mcp_2: {
    description: 'Sensor de humedad en tierra 3',
    units: '%',
    max: 1024,
    inverse: true,
  },
  mcp_3: {
    description: 'Sensor de humedad en tierra 4',
    units: '%',
    max: 1024,
    inverse: true,
  },
  mcp_4: {
    description: 'Sensor de humedad en tierra 5',
    units: '%',
    max: 1024,
    inverse: true,
  },
  mcp_5: {
    description: 'Sensor de humedad en tierra 6',
    units: '%',
    max: 1024,
    inverse: true,
  },
  mcp_6: {
    description: 'Sensor de lluvia',
    units: '%',
    max: 1024,
    inverse: true,
  },
  mcp_7: {
    description: 'Sensor de calidad del aire',
    units: 'ppm',
    max: 1024,
    inverse: false,
  },
};