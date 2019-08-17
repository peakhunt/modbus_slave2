<template>
<v-card dark class="elevation-12">
  <v-toolbar>
    <v-toolbar-title class="text-uppercase">
      {{commPort.config.type}} &nbsp; {{ commPort.config.commParam.port }}
      &nbsp;
      {{commPort.stat.numRx}}/{{commPort.stat.numTx}}
    </v-toolbar-title>
    <v-spacer/>

    <v-toolbar-items>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn flat icon v-on="on" @click="onNewSlave" :disabled="runtimeStarted">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <span>Add New Slave</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn flat icon v-on="on" @click="onDelCommPort" :disabled="runtimeStarted">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
        <span>Delete Comm Port</span>
      </v-tooltip>
    </v-toolbar-items>
  </v-toolbar>

  <CommPortConfig :commPort="commPort"/>

  <v-tabs
   v-model="active"
   dark
  >
   <v-tab v-for="(slave, ndx) in commPort.slaves" :key="ndx">
    Slave-{{slave.address}}
    &nbsp;
    {{slave.stat.numRx}}/{{slave.stat.numTx}}

    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-btn flat icon v-on="on" @click="onDelSlave(slave)" :disabled="runtimeStarted">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
      <span>Delete slave</span>
    </v-tooltip>

   </v-tab>

   <v-tab-item v-for="(slave, ndx) in commPort.slaves" :key="ndx">
     <ModbusSlave :slave="slave"/>
   </v-tab-item>
  </v-tabs>
</v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import CommPortConfig from './CommPortConfig.vue';
import ModbusSlave from './ModbusSlave.vue';

export default {
  name: 'CommPort',
  components: {
    CommPortConfig,
    ModbusSlave,
  },
  computed: {
    ...mapGetters([
      'runtimeStarted',
    ]),
  },
  props: {
    commPort: { type: Object },
  },
  data() {
    return {
      active: null,
    };
  },
  methods: {
    onNewSlave() {
      this.$store.dispatch('slaveAddNew', this.commPort);
    },
    onDelCommPort() {
      this.$store.dispatch('commPortDel', this.commPort);
    },
    onDelSlave(slave) {
      this.$store.dispatch('slaveDel', { commPort: this.commPort, slave });
    },
  },
};
</script>

<style>
</style>
