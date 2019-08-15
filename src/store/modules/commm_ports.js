import Vue from 'vue';
import SerialPort from 'serialport';

const serialBauds = [9600, 19200, 38400, 57600, 115200];
let serialPorts = [
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
        port: serialPorts[0] || 'No Comm Port',
        baud: serialBauds[0],
        parity: serialParities[0],
        dataBit: serialDatabits[3],
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
      stat: {
        numRx: 0,
        numTx: 0,
      },
      slaves: [],
    };

    setCommPortConfig(commPort, 'tcp');
    state.commPorts.push(commPort);
  },
  COMM_PORT_DEL(_, commPort) {
    const ndx = state.commPorts.indexOf(commPort);
    state.commPorts.splice(ndx, 1);
  },
  COMM_PORT_INC_STAT(_, payload) {
    const { c, item } = payload;

    c.stat[item] += 1;
  },
  COMM_PORT_RESET_STAT(_, commPort) {
    const c = commPort;

    c.stat.numRx = 0;
    c.stat.numTx = 0;
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
  COMM_UPDATE_TYPE(_, payload) {
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
  COMM_UPDATE_COMM_PARAM(_, payload) {
    const { commPort } = payload;

    commPort.config.commParam[payload.name] = payload.value;
  },
  UPDATE_COMM_PORT_LIST(_, portList) {
    serialPorts = portList;
  },
  SET_COMMPORTS(_, commPorts) {
    Vue.set(state, 'commPorts', commPorts);
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
  refreshPortList(context, cb) {
    SerialPort.list((err, results) => {
      if (err) {
        cb(err);
        return;
      }

      const portList = [];

      results.forEach((port) => {
        console.log(`port ${port.comName}`);
        portList.push(port.comName);
      });
      context.commit('UPDATE_COMM_PORT_LIST', portList);

      if (cb !== undefined) {
        cb(undefined, results);
      }
    });
  },
};

const getters = {
  commPorts() {
    return state.commPorts;
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
