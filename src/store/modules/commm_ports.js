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
function handleSetRegister(commPort, addr, value, unitID, cb) {
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

  reg.value = value;
  cb();
}

/* eslint-disable no-unused-vars */
function handleSetCoil(commPort, addr, value, unitID, cb) {
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

  reg.value = value;
  cb();
}

const state = {
  commPorts: [],
  runtime: {
    started: false,
    modbus: [],
  },
};

function onRx(payload) {
  console.log(`onRx ${payload.frame}`);
}

function onTx(payload) {
  console.log(`onTx ${payload.frame}`);
}

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
  UPDATE_COMM_PORT_LIST(_, portList) {
    serialPorts = portList;
  },
  NEW_PROJECT() {
    state.commPorts = [];
  },
  LOAD_PROJECT(s, commPorts) {
    state.commPorts = commPorts;
  },
  START_COMM_PORT(s, payload) {
    const { port, ndx } = payload;
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
        handleSetRegister(port, addr, value, unitID, cb);
      },
      /* eslint-disable no-unused-vars */
      setCoil: (addr, value, unitID, cb) => {
        handleSetCoil(port, addr, value, unitID, cb);
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

    instance.addListener('rx', onRx);
    instance.addListener('tx', onTx);

    state.runtime.modbus[ndx] = instance;
  },
  STOP_COMM_PORT(s, payload) {
    const { ndx } = payload;

    state.runtime.modbus[ndx].removeListener('rx', onRx);
    state.runtime.modbus[ndx].removeListener('tx', onTx);

    state.runtime.modbus[ndx].close();
    state.runtime.modbus[ndx] = null;
  },
  SET_STARTED(s, v) {
    state.runtime.started = v;
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
      context.commit('START_COMM_PORT', { port, ndx });
    });
    context.commit('SET_STARTED', true);
  },
  stopSlaves(context) {
    state.commPorts.forEach((port, ndx) => {
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
  runtimeStarted() {
    return state.runtime.started;
  },
};

export default {
  state,
  mutations,
  actions,
  getters,
};
