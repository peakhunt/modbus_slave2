import jsonfile from 'jsonfile';

const { dialog } = require('electron').remote;

const state = {
};

const actions = {
  newProject(context) {
    context.commit('COMM_PORT_CLEAR');
    context.commit('MBSIM_RESET');
  },
  saveProject(context) {
    dialog.showSaveDialog({
      title: 'Save Current Project',
      filters: [
        { name: 'MODBUS Slave Setting', extension: ['json'] },
      ],
    }, (filename) => {
      if (filename === undefined) {
        return;
      }
      jsonfile.writeFileSync(filename, context.getters.commPorts, { spaces: 2, EOL: '\n' });
    });
  },
  loadProject(context) {
    dialog.showOpenDialog({
      title: 'Load Project',
      filters: [
        { name: 'MODBUS Slave Setting', extension: ['json'] },
      ],
    }, (filePaths) => {
      if (filePaths === undefined) {
        return;
      }

      jsonfile.readFile(filePaths[0], { EOL: '\n' }, (err, json) => {
        if (err) {
          console.log(err);
          return;
        }
        context.commit('SET_COMMPORTS', json);
        context.commit('MBSIM_RESET');
        context.getters.commPorts.forEach((commPort) => {
          context.commit('COMM_PORT_RESET_STAT', commPort);
          commPort.slaves.forEach((slave) => {
            context.commit('SLAVE_REBUILD_REG', slave);
            context.commit('SLAVE_RESET_STAT', slave);
          });
        });
      });
    });
  },
};

const getters = {
};

export default {
  state,
  actions,
  getters,
};
