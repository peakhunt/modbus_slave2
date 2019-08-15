import jsonfile from 'jsonfile';
import os from 'os';

const { dialog } = require('electron').remote;

function getJSONOpt() {
  if (os.platform() === 'win32') {
    return {
      EOL: '\r\n',
      spaces: 2,
    };
  }
  return {
    EOL: '\n',
    spaces: 2,
  };
}

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
      jsonfile.writeFileSync(filename, context.getters.commPorts, getJSONOpt());
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

      jsonfile.readFile(filePaths[0], getJSONOpt(), (err, json) => {
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
