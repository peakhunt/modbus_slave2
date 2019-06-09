const mutations = {
  SLAVE_ADD_NEW(s, commPort) {
    const slave = {
      address: 0,
      registers: {
      },
    };

    commPort.slaves.push(slave);
  },
  SLAVE_DEL(s, payload) {
    const { slave, commPort } = payload;
    const ndx = commPort.slaves.indexOf(slave);

    commPort.slaves.splice(ndx, 1);
  },
  SLAVE_UPDATE_ADDRESS(s, payload) {
    const { address, slave } = payload;

    slave.address = address;
  },
};

const actions = {
  slaveAddNew(context, commPort) {
    context.commit('SLAVE_ADD_NEW', commPort);
  },
  slaveDel(context, payload) {
    context.commit('SLAVE_DEL', payload);
  },
};

export default {
  mutations,
  actions,
};
