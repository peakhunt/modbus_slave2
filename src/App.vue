<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>MODBUS &nbsp;</span>
        <span class="font-weight-light">Slave Simulator</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-tooltip bottom v-if="!runtimeStarted">
        <template #activator="data">
          <v-btn icon v-on="data.on" @click="onStartSlave">
            <v-icon large>mdi-play</v-icon>
          </v-btn>
        </template>
        <span>Start Slave</span>
      </v-tooltip>

      <v-tooltip bottom v-if="runtimeStarted">
        <template #activator="data">
          <v-btn icon v-on="data.on" @click="onStopSlave">
            <v-icon large>mdi-pause</v-icon>
          </v-btn>
        </template>
        <span>Stop Slave</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="data">
          <v-btn icon v-on="data.on" @click="onNewCommPort" :disabled="runtimeStarted">
            <v-icon large>mdi-plus</v-icon>
          </v-btn>
        </template>
        <span>New Communication Port</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="data">
          <v-btn icon v-on="data.on" @click="onScanCommPorts" :disabled="runtimeStarted">
            <v-icon large>mdi-refresh</v-icon>
          </v-btn>
        </template>
        <span>Scan Comm Ports</span>
      </v-tooltip>

      <v-btn flat @click="onNewProject">
        <span class="mr-2">New</span>
      </v-btn>
      <v-btn flat @click="onSaveProject">
        <span class="mr-2">Save</span>
      </v-btn>
      <v-btn flat @click="onLoadProject">
        <span class="mr-2">Load</span>
      </v-btn>

    </v-toolbar>

    <v-content>
      <ModbusSlaveSim/>
    </v-content>

    <v-dialog max-width="50%" persistent
              v-model="portRefreshDlg.show"
              hide-overlay>
      <v-card color="primary">
        <v-card-text>
          <v-container fluid grid-list-lg>
            <v-layout row wrap justify-center>
              Updating Port List
            </v-layout>
            <v-divider/>
            <v-layout row wrap justify-center>
              <v-progress-circular :size="50"
                                   color="green"
                                   indeterminate
              />
            </v-layout>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex';
import ModbusSlaveSim from './components/ModbusSlaveSim.vue';

export default {
  name: 'App',
  components: {
    ModbusSlaveSim,
  },
  computed: {
    ...mapGetters([
      'runtimeStarted',
    ]),
  },
  data() {
    return {
      portRefreshDlg: {
        show: false,
      },
    };
  },
  methods: {
    onStartSlave() {
      this.$store.dispatch('startSlaves');
    },
    onStopSlave() {
      this.$store.dispatch('stopSlaves');
    },
    onNewCommPort() {
      this.$store.dispatch('commPortAddNew');
    },
    onNewProject() {
      this.$store.dispatch('newProject');
    },
    onSaveProject() {
      this.$store.dispatch('saveProject');
    },
    onLoadProject() {
      this.$store.dispatch('loadProject');
    },
    onScanCommPorts() {
      this.portRefreshDlg.show = true;
      this.$store.dispatch('refreshPortList', () => {
        setTimeout(() => {
          this.portRefreshDlg.show = false;
        }, 1000);
      });
    },
  },
  mounted() {
    this.onScanCommPorts();
  },
};
</script>
