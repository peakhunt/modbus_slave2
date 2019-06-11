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
            <v-icon large>play_arrow</v-icon>
          </v-btn>
        </template>
        <span>Start Slave</span>
      </v-tooltip>

      <v-tooltip bottom v-if="runtimeStarted">
        <template #activator="data">
          <v-btn icon v-on="data.on" @click="onStopSlave">
            <v-icon large>pause</v-icon>
          </v-btn>
        </template>
        <span>Stop Slave</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="data">
          <v-btn icon v-on="data.on" @click="onNewCommPort">
            <v-icon large>add</v-icon>
          </v-btn>
        </template>
        <span>New Communication Port</span>
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
      //
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
  },
};
</script>
