import ModbusTCP from 'modbus-servertcp';
import ModbusRTU from 'modbus-serverrtu';

let modbusList = [];

function getSlaveFromCommPort(commPort, unitID) {
  for (let i = 0; i < commPort.slaves.length; i += 1) {
    if (commPort.slaves[i].address === unitID) {
      return commPort.slaves[i];
    }
  }
  return null;
}

/* eslint-disable no-unused-vars */
function handleGetInputRegister(context, commPort, addr, unitID, cb) {
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
function handleGetHoldingRegister(context, commPort, addr, unitID, cb) {
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
function handleGetCoil(context, commPort, addr, unitID, cb) {
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
function handleGetDiscreteInput(context, commPort, addr, unitID, cb) {
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

function handleRxFrameEvent(context, port, payload) {
  const { frame } = payload;
  let ndx;

  context.commit('COMM_PORT_INC_STAT', { c: port, item: 'numRx' });

  if (port.config.type === 'rtu') {
    ndx = 0;
  } else {
    ndx = 6;
  }

  const slave = getSlaveFromCommPort(port, frame[ndx]);

  if (slave !== null) {
    context.commit('SLAVE_INC_STAT', { s: slave, item: 'numRx' });
  }
}

function handleTxFrameEvent(context, port, payload) {
  const { frame } = payload;
  let ndx;

  context.commit('COMM_PORT_INC_STAT', { c: port, item: 'numTx' });

  if (port.config.type === 'rtu') {
    ndx = 0;
  } else {
    ndx = 6;
  }

  const slave = getSlaveFromCommPort(port, frame[ndx]);

  if (slave !== null) {
    context.commit('SLAVE_INC_STAT', { s: slave, item: 'numTx' });
  }
}

const state = {
  started: false,
};

const mutations = {
  MBSIM_RESET() {
    modbusList.forEach((m) => {
      if (m !== null) {
        m.close();
      }
    });

    state.started = false;

    modbusList = [];
  },
  SET_STARTED(s, v) {
    state.started = v;
  },
  START_MODBUS(_, payload) {
    const { context, port, ndx } = payload;
    let instance;

    const vector = {
      /* eslint-disable no-unused-vars */
      getInputRegister: (addr, unitID, cb) => {
        handleGetInputRegister(context, port, addr, unitID, cb);
      },
      /* eslint-disable no-unused-vars */
      getHoldingRegister: (addr, unitID, cb) => {
        handleGetHoldingRegister(context, port, addr, unitID, cb);
      },
      /* eslint-disable no-unused-vars */
      getCoil: (addr, unitID, cb) => {
        handleGetCoil(context, port, addr, unitID, cb);
      },
      /* eslint-disable no-unused-vars */
      getDiscreteInput: (addr, unitID, cb) => {
        handleGetDiscreteInput(context, port, addr, unitID, cb);
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
      instance = new ModbusTCP(vector, {
        host: '0.0.0.0',
        port: port.config.commParam.port,
      });
    }
    modbusList[ndx] = instance;

    if (instance !== null) {
      instance.on('rx', (p) => {
        handleRxFrameEvent(context, port, p);
      });

      instance.on('tx', (p) => {
        handleTxFrameEvent(context, port, p);
      });
    }
  },
  STOP_MODBUS(_, payload) {
    const { ndx } = payload;

    if (modbusList[ndx] !== null) {
      modbusList[ndx].removeAllListeners();
    }
    modbusList[ndx].close();
    modbusList[ndx] = null;
  },
};

const actions = {
  startSlaves(context) {
    context.getters.commPorts.forEach((port, ndx) => {
      context.commit('START_MODBUS', { context, port, ndx });
    });
    context.commit('SET_STARTED', true);
  },
  stopSlaves(context) {
    context.getters.commPorts.forEach((port, ndx) => {
      modbusList[ndx].removeAllListeners();
      context.commit('STOP_MODBUS', { port, ndx });
    });
    context.commit('SET_STARTED', false);
  },
};

const getters = {
  runtimeStarted() {
    return state.started;
  },
};

export default {
  state,
  mutations,
  actions,
  getters,
};
