module.exports = {
  light: {
    description: 'sensor de luz',
    units: 'lux',
    max: 65535,
    inverse: false,
  },
  dht22_humidity: {
    description: 'sensor de humedad',
    units: '%',
    max: 100,
    inverse: false,
  },
  dht22_temperature: {
    description: 'sensor de temperatura interior',
    units: 'ºC',
    inverse: false,
  },
  temp1w: {
    description: 'sensor de temperatura exterior',
    units: 'ºC',
    inverse: false,
  },
  mcp_0: {
    description: 'sensor de humedad en tierra 1',
    units: '%',
    max: 1024,
    inverse: true,
  },
  mcp_1: {
    description: 'sensor de humedad en tierra 2',
    units: '%',
    max: 1024,
    inverse: true,
  },
  mcp_2: {
    description: 'sensor de humedad en tierra 3',
    units: '%',
    max: 1024,
    inverse: true,
  },
  mcp_3: {
    description: 'sensor de humedad en tierra 4',
    units: '%',
    max: 1024,
    inverse: true,
  },
  mcp_4: {
    description: 'sensor de humedad en tierra 5',
    units: '%',
    max: 1024,
    inverse: true,
  },
  mcp_5: {
    description: 'sensor de humedad en tierra 6',
    units: '%',
    max: 1024,
    inverse: true,
  },
  mcp_6: {
    description: 'sensor de lluvia',
    units: '%',
    max: 1024,
    inverse: true,
  },
  mcp_7: {
    description: 'sensor de calidad del aire',
    units: 'ppm',
    max: 1024,
    inverse: false,
  },
};