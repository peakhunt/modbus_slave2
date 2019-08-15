import Vue from 'vue';

const mutations = {
  SLAVE_ADD_NEW(s, commPort) {
    const slave = {
      address: 0,
      stat: {
        numRx: 0,
        numTx: 0,
      },
      registers: {
        coil: {
        },
        discrete: {
        },
        holding: {
        },
        input: {
        },
      },
      registerList: [],
    };

    commPort.slaves.push(slave);
  },
  SLAVE_DEL(s, payload) {
    const { slave, commPort } = payload;
    const ndx = commPort.slaves.indexOf(slave);

    commPort.slaves.splice(ndx, 1);
  },
  SLAVE_INC_STAT(_, payload) {
    const { s, item } = payload;

    s.stat[item] += 1;
  },
  SLAVE_RESET_STAT(_, slave) {
    const s = slave;

    s.stat.numRx = 0;
    s.stat.numTx = 0;
  },
  SLAVE_UPDATE_ADDRESS(s, payload) {
    const { address, slave } = payload;

    slave.address = address;
  },
  SLAVE_ADD_REG(s, payload) {
    const { slave, regCfg } = payload;
    const reg = JSON.parse(JSON.stringify(regCfg));

    slave.registerList.push(reg);
    Vue.set(slave.registers[reg.type], reg.address, reg);
  },
  SLAVE_DEL_REG(s, payload) {
    const { slave, reg } = payload;
    const ndx = slave.registerList.indexOf(reg);

    slave.registerList.splice(ndx, 1);
    Vue.delete(slave.registers[reg.type], reg.address);
  },
  SLAVE_REBUILD_REG(_, slave) {
    const s = slave;

    s.registerList.forEach((reg) => {
      s.registers[reg.type][reg.address] = reg;
    });
  },
  SLAVE_UPDATE_REG(s, payload) {
    const { slave, oldReg, newReg } = payload;
    const ndx = slave.registerList.indexOf(oldReg);
    const reg = JSON.parse(JSON.stringify(newReg));

    // delete old register from dictionary
    Vue.delete(slave.registers[oldReg.type], oldReg.address);

    // add new register to dictionary
    Vue.set(slave.registers[reg.type], reg.address, reg);

    // update register in registerList
    Vue.set(slave.registerList, ndx, reg);
  },
  UPDATE_REG(_, payload) {
    const { reg, value } = payload;

    reg.value = value;
  },
};

const actions = {
  slaveAddNew(context, commPort) {
    context.commit('SLAVE_ADD_NEW', commPort);
  },
  slaveDel(context, payload) {
    context.commit('SLAVE_DEL', payload);
  },
  slaveAddRegister(context, payload) {
    context.commit('SLAVE_ADD_REG', payload);
  },
  slaveDelRegister(context, payload) {
    context.commit('SLAVE_DEL_REG', payload);
  },
  slaveUpdateRegister(context, payload) {
    context.commit('SLAVE_UPDATE_REG', payload);
  },
};

const getters = {
};

export default {
  mutations,
  actions,
  getters,
};
