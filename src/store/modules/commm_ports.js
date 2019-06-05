import Vue from 'vue';

function setCommPortConfig(commPort, config) {
  let c;

  if (config.type === 'rtu') {
    c = {
      type: 'rtu',
      commParam: {
        port: config.commParam.port,
        baud: config.commParam.baud,
        parity: config.commParam.parity,
        dataBit: config.commParam.dataBit,
        stopBit: config.commParam.stopBit,
      },
    };
  } else {
    c = {
      type: 'tcp',
      commParam: {
        port: config.commParam.port,
      },
    };
  }
  Vue.set(commPort, 'config', c);
}

const state = {
  commPorts: [],
};

const mutations = {
  COMM_PORT_ADD(s, config) {
    const commPort = {
      config: null,
      slaves: [],
    };

    setCommPortConfig(commPort, config);
    state.commPorts.push(commPort);
  },
  COMM_PORT_DEL(s, commPort) {
    const ndx = state.commPorts.indexOf(commPort);
    state.commPorts.splice(ndx, 1);
  },
  COMM_PORT_CONFIG_UPDATE(s, payload) {
    setCommPortConfig(payload.commPort, payload.config);
  },
  COMM_PORT_CLEAR() {
    state.commPorts = [];
  },
};

const actions = {
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
   * update comm port
   * @param {object} payload
   * payload: {
   *   commPort,
   *   config
   * }
   */
  commPortUpdate(context, payload) {
    context.commit('COMM_PORT_CONFIG_UPDATE', payload);
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
};

export default {
  state,
  mutations,
  actions,
  getters,
};
