<template>
<v-container fluid grid-list-lg>
  <v-layout row wrap justify-center>
    <v-flex xs12 v-for="(commPort, ndx) in commPorts" :key="ndx">
      <CommPort :commPort="commPort"/>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
import CommPort from './CommPort.vue';

export default {
  name: 'ModbusSlaveSim',
  components: {
    CommPort,
  },
  data() {
    return {
      commPorts: [
        {
          type: 'rtu',
          commParam: {
            port: '/dev/ttyUSB0',
            baud: 38400,
            parity: 'none',
            dataBit: 8,
            stopBit: 1,
          },
        },
        {
          type: 'tcp',
          commParam: {
            port: 11039,
          },
        },
      ],
    };
  },
};
</script>
