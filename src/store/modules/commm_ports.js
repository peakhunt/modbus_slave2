import Vue from 'vue';

const serialBauds = [9600, 19200, 38400, 57600, 115200];
const serialPorts = [
  '/dev/ttyUSB0',
  '/dev/ttyUSB1',
  '/dev/ttyUSB2',
];
const serialParities = [
  'none',
  'even',
  'odd',
  'mark',
  'space',
];
const serialDatabits = [5, 6, 7, 8];
const serialStopbits = [1, 2];
const tcpDefaultPort = 10123;

function setCommPortConfig(commPort, type) {
  let c;

  if (type === 'rtu') {
    c = {
      type: 'rtu',
      commParam: {
        port: serialPorts[0],
        baud: serialBauds[0],
        parity: serialParities[0],
        dataBit: serialDatabits[0],
        stopBit: serialStopbits[0],
      },
    };
  } else {
    c = {
      type: 'tcp',
      commParam: {
        port: tcpDefaultPort,
      },
    };
  }
  Vue.set(commPort, 'config', c);
}

const state = {
  commPorts: [],
};

const mutations = {
  COMM_PORT_ADD() {
    const commPort = {
      config: null,
      slaves: [],
    };

    setCommPortConfig(commPort, 'tcp');
    state.commPorts.push(commPort);
  },
  COMM_PORT_DEL(s, commPort) {
    const ndx = state.commPorts.indexOf(commPort);
    state.commPorts.splice(ndx, 1);
  },
  COMM_PORT_CLEAR() {
    state.commPorts = [];
  },
  /**
   * change comm port protocol type
   * @param {object} payload
   * payload: {
   *   commPort,
   *   type: 'tcp' or 'rtu',
   * }
   */
  COMM_UPDATE_TYPE(s, payload) {
    setCommPortConfig(payload.commPort, payload.type);
  },
  /**
   * change communication parameter
   * @param {object} payload
   * payload: {
   *   commPort,
   *   name,
   *   value,
   * }
   */
  COMM_UPDATE_COMM_PARAM(s, payload) {
    const { commPort } = payload;

    commPort.config.commParam[payload.name] = payload.value;
  },
};

const actions = {
  /**
   * add new comm ports with default tcp setting
   *
   */
  commPortAddNew(context) {
    context.commit('COMM_PORT_ADD');
  },
  /**
   * add new comm ports
   * @param {object} config - comm port configuration
   * config: {
   *   "type": "rtu" or "tcp",
   *   "commParam": {
   *     "port": device name or tcp port number
   *     "baud": rtu baud rate
   *     "parity": "none" | "even" | "odd"
   *     "dataBit": number of data bit
   *     "stopBit": 1 for 1 stop bit  or 2 1.5 stop bit
   *   }
   * }
   */
  commPortAdd(context, config) {
    context.commit('COMM_PORT_ADD', config);
  },
  /**
   * delete comm port from store
   * @param {object} commPort - comm port instance
   */
  commPortDel(context, commPort) {
    context.commit('COMM_PORT_DEL', commPort);
  },
  /**
   * clear comm ports list
   */
  commPortClear(context) {
    context.commit('COMM_PORT_CLEAR');
  },
};

const getters = {
  commPorts(context) {
    return context.commPorts;
  },
  commProtocols() {
    return ['rtu', 'tcp'];
  },
  commSerialBauds() {
    return serialBauds;
  },
  commSerialPorts() {
    return serialPorts;
  },
  commSerialParities() {
    return serialParities;
  },
  commSerialDataBits() {
    return serialDatabits;
  },
  commSerialStopbits() {
    return serialStopbits;
  },
};

export default {
  state,
  mutations,
  actions,
  getters,
};
