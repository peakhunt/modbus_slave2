import Vue from 'vue';
import jsonfile from 'jsonfile';
import ModbusTCP from 'modbus-servertcp';
import ModbusRTU from 'modbus-serverrtu';
import SerialPort from 'serialport';

const { dialog } = require('electron').remote;

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

function getSlaveFromCommPort(commPort, unitID) {
  for (let i = 0; i < commPort.slaves.length; i += 1) {
    if (commPort.slaves[i].address === unitID) {
      return commPort.slaves[i];
    }
  }
  return null;
}

/* eslint-disable no-unused-vars */
function handleGetInputRegister(commPort, addr, unitID, cb) {
  const slave = getSlaveFromCommPort(commPort, unitID);

  if (slave === null) {
    cb({ modbusErrorCode: 0x04 });
    return;
  }

  const reg = slave.registers.input[addr];

  if (reg === undefined) {
    cb({ modbusErrorCode: 0x02 });
    return;
  }

  cb(null, reg.value);
}

/* eslint-disable no-unused-vars */
function handleGetHoldingRegister(commPort, addr, unitID, cb) {
  const slave = getSlaveFromCommPort(commPort, unitID);

  if (slave === null) {
    cb({ modbusErrorCode: 0x04 });
    return;
  }

  const reg = slave.registers.holding[addr];

  if (reg === undefined) {
    cb({ modbusErrorCode: 0x02 });
    return;
  }

  cb(null, reg.value);
}

/* eslint-disable no-unused-vars */
function handleGetCoil(commPort, addr, unitID, cb) {
  const slave = getSlaveFromCommPort(commPort, unitID);

  if (slave === null) {
    cb({ modbusErrorCode: 0x04 });
    return;
  }

  const reg = slave.registers.coil[addr];

  if (reg === undefined) {
    cb({ modbusErrorCode: 0x02 });
    return;
  }

  cb(null, reg.value);
}

/* eslint-disable no-unused-vars */
function handleGetDiscreteInput(commPort, addr, unitID, cb) {
  const slave = getSlaveFromCommPort(commPort, unitID);

  if (slave === null) {
    cb({ modbusErrorCode: 0x04 });
    return;
  }

  const reg = slave.registers.discrete[addr];

  if (reg === undefined) {
    cb({ modbusErrorCode: 0x02 });
    return;
  }

  cb(null, reg.value);
}

/* eslint-disable no-unused-vars */
function handleSetRegister(context, commPort, addr, value, unitID, cb) {
  const slave = getSlaveFromCommPort(commPort, unitID);

  if (slave === null) {
    cb({ modbusErrorCode: 0x04 });
    return;
  }

  const reg = slave.registers.holding[addr];

  if (reg === undefined) {
    cb({ modbusErrorCode: 0x02 });
    return;
  }

  context.commit('UPDATE_REG', { reg, value });
  cb();
}

/* eslint-disable no-unused-vars */
function handleSetCoil(context, commPort, addr, value, unitID, cb) {
  const slave = getSlaveFromCommPort(commPort, unitID);

  if (slave === null) {
    cb({ modbusErrorCode: 0x04 });
    return;
  }

  const reg = slave.registers.coil[addr];

  if (reg === undefined) {
    cb({ modbusErrorCode: 0x02 });
    return;
  }

  context.commit('UPDATE_REG', { reg, value });
  cb();
}

const state = {
  commPorts: [],
  runtime: [],
  started: false,
};

let modbusList = [];


function addNewRuntime() {
  state.runtime.push({
    stats: {
      numRxFrame: 0,
      numTxFrame: 0,
      numRxBytes: 0,
      numTxBytes: 0,
    },
  });
}

function resetAndRebuildRuntime() {
  modbusList.forEach((m) => {
    if (m !== null) {
      m.close();
    }
  });

  state.runtime = [];
  state.started = false;

  modbusList = [];

  state.commPorts.forEach(() => {
    addNewRuntime();
  });
}

const mutations = {
  COMM_PORT_ADD() {
    const commPort = {
      config: null,
      slaves: [],
    };

    setCommPortConfig(commPort, 'tcp');
    state.commPorts.push(commPort);
    addNewRuntime();
  },
  COMM_PORT_DEL(_, commPort) {
    const ndx = state.commPorts.indexOf(commPort);
    state.commPorts.splice(ndx, 1);

    if (modbusList[ndx] !== null) {
      modbusList[ndx].close();
    }
    state.runtime.splice(ndx, 1);
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
  NEW_PROJECT() {
    state.commPorts = [];
    resetAndRebuildRuntime();
  },
  LOAD_PROJECT(_, commPorts) {
    state.commPorts = commPorts;
    resetAndRebuildRuntime();
  },
  START_COMM_PORT(_, payload) {
    const { context, port, ndx } = payload;
    let instance;

    const vector = {
      /* eslint-disable no-unused-vars */
      getInputRegister: (addr, unitID, cb) => {
        handleGetInputRegister(port, addr, unitID, cb);
      },
      /* eslint-disable no-unused-vars */
      getHoldingRegister: (addr, unitID, cb) => {
        handleGetHoldingRegister(port, addr, unitID, cb);
      },
      /* eslint-disable no-unused-vars */
      getCoil: (addr, unitID, cb) => {
        handleGetCoil(port, addr, unitID, cb);
      },
      /* eslint-disable no-unused-vars */
      getDiscreteInput: (addr, unitID, cb) => {
        handleGetDiscreteInput(port, addr, unitID, cb);
      },
      /* eslint-disable no-unused-vars */
      setRegister: (addr, value, unitID, cb) => {
        handleSetRegister(context, port, addr, value, unitID, cb);
      },
      /* eslint-disable no-unused-vars */
      setCoil: (addr, value, unitID, cb) => {
        handleSetCoil(context, port, addr, value, unitID, cb);
      },
    };

    if (port.config.type === 'rtu') {
      const options = {
        baudRate: port.config.commParam.baud,
        dataBits: port.config.commParam.dataBit,
        stopBits: port.config.commParam.stopBit,
        parity: port.config.commParam.parity,
        modbusRXTimeout: 500,
      };

      instance = new ModbusRTU(vector, port.config.commParam.port, options);
      instance.open();
    } else {
      /*
      instance = new modbus.ServerTCP(vector, {
        host: '0.0.0.0',
        port: port.config.commParam.port,
      });
      */
      instance = new ModbusTCP(vector, {
        host: '0.0.0.0',
        port: port.config.commParam.port,
      });
    }
    modbusList[ndx] = instance;
  },
  STOP_COMM_PORT(_, payload) {
    const { ndx } = payload;

    modbusList[ndx].close();
    modbusList[ndx] = null;
  },
  SET_STARTED(s, v) {
    state.started = v;
  },
  RX_STAT(s, payload) {
    const { ndx } = payload;

    state.runtime[ndx].stats.numRxFrame += 1;
  },
  TX_STAT(s, payload) {
    const { ndx } = payload;

    state.runtime[ndx].stats.numTxFrame += 1;
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
  newProject(context) {
    context.commit('NEW_PROJECT');
  },
  saveProject() {
    dialog.showSaveDialog({
      title: 'Save Current Project',
      filters: [
        { name: 'MODBUS Slave Setting', extension: ['json'] },
      ],
    }, (filename) => {
      jsonfile.writeFileSync(filename, state.commPorts, { spaces: 2 });
    });
  },
  loadProject(context) {
    dialog.showOpenDialog({
      title: 'Load Project',
      filters: [
        { name: 'MODBUS Slave Setting', extension: ['json'] },
      ],
    }, (filePaths) => {
      jsonfile.readFile(filePaths[0], (err, json) => {
        if (err) {
          console.log(err);
          return;
        }
        context.commit('LOAD_PROJECT', json);
      });
    });
  },
  startSlaves(context) {
    state.commPorts.forEach((port, ndx) => {
      context.commit('START_COMM_PORT', { context, port, ndx });

      modbusList[ndx].addListener('rx', (payload) => {
        context.commit('RX_STAT', { ndx, frame: payload.frame });
      });

      modbusList[ndx].addListener('tx', (payload) => {
        context.commit('TX_STAT', { ndx, frame: payload.frame });
      });
    });
    context.commit('SET_STARTED', true);
  },
  stopSlaves(context) {
    state.commPorts.forEach((port, ndx) => {
      modbusList[ndx].removeAllListeners();
      context.commit('STOP_COMM_PORT', { port, ndx });
    });
    context.commit('SET_STARTED', false);
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
  runtimeStarted() {
    return state.started;
  },
  commPortRuntime: () => (commPort) => {
    const ndx = state.commPorts.indexOf(commPort);

    return state.runtime[ndx];
  },
};

export default {
  state,
  mutations,
  actions,
  getters,
};
