<template>
<v-card>
  <v-card-title>
    Comm Port View
  </v-card-title>
  <v-card-text>
    <v-layout wrap>
      <v-flex xs6>
        <v-select
         v-model="protocol"
         :items="commProtocols"
         label="Communication Protocol"
        />
      </v-flex>
      <v-flex xs6>
        <v-text-field
         v-if="commPort.config.type === 'tcp'"
         label="TCP Port"
         v-model="tcpPort"
         />
        <v-select
         v-if="commPort.config.type === 'rtu'"
         v-model="serialPort"
         :items="commSerialPorts"
         label="Serial Port"
         />
      </v-flex>

      <v-flex xs6 v-if="commPort.config.type === 'rtu'">
        <v-select
         v-model="serialBaud"
         :items="commSerialBauds"
         label="Baud Rate"
        />
      </v-flex>
      <v-flex xs6 v-if="commPort.config.type === 'rtu'">
        <v-select
         v-model="serialParity"
         :items="commSerialParities"
         label="Parity"
        />
      </v-flex>
      <v-flex xs6 v-if="commPort.config.type === 'rtu'">
        <v-select
         v-model="serialDatabit"
         :items="commSerialDataBits"
         label="Data Bits"
        />
      </v-flex>
      <v-flex xs6 v-if="commPort.config.type === 'rtu'">
        <v-select
         v-model="serialStopbit"
         :items="commSerialStopbits"
         label="Stop Bits"
        />
      </v-flex>

    </v-layout>
  </v-card-text>
</v-card>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'CommPort',
  props: {
    commPort: { type: Object },
  },
  computed: {
    ...mapGetters([
      'commProtocols',
      'commSerialBauds',
      'commSerialPorts',
      'commSerialParities',
      'commSerialDataBits',
      'commSerialStopbits',
    ]),
    protocol: {
      get() {
        return this.commPort.config.type;
      },
      set(value) {
        this.$store.commit('COMM_UPDATE_TYPE', {
          commPort: this.commPort,
          type: value,
        });
      },
    },
    tcpPort: {
      get() {
        return this.commPort.config.commParam.port;
      },
      set(value) {
        this.$store.commit('COMM_UPDATE_COMM_PARAM', {
          commPort: this.commPort,
          name: 'port',
          value: parseInt(value, 10),
        });
      },
    },
    serialPort: {
      get() {
        return this.commPort.config.commParam.port;
      },
      set(value) {
        this.$store.commit('COMM_UPDATE_COMM_PARAM', {
          commPort: this.commPort,
          name: 'port',
          value,
        });
      },
    },
    serialBaud: {
      get() {
        return this.commPort.config.commParam.baud;
      },
      set(value) {
        this.$store.commit('COMM_UPDATE_COMM_PARAM', {
          commPort: this.commPort,
          name: 'baud',
          value,
        });
      },
    },
    serialParity: {
      get() {
        return this.commPort.config.commParam.parity;
      },
      set(value) {
        this.$store.commit('COMM_UPDATE_COMM_PARAM', {
          commPort: this.commPort,
          name: 'parity',
          value,
        });
      },
    },
    serialDatabit: {
      get() {
        return this.commPort.config.commParam.dataBit;
      },
      set(value) {
        this.$store.commit('COMM_UPDATE_COMM_PARAM', {
          commPort: this.commPort,
          name: 'dataBit',
          value,
        });
      },
    },
    serialStopbit: {
      get() {
        return this.commPort.config.commParam.stopBit;
      },
      set(value) {
        this.$store.commit('COMM_UPDATE_COMM_PARAM', {
          commPort: this.commPort,
          name: 'stopBit',
          value,
        });
      },
    },
  },
  data() {
    return {
    };
  },
};
</script>

<style>
</style>
