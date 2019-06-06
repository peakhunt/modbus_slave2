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
import { mapGetters } from 'vuex';
import CommPort from './CommPort.vue';

export default {
  name: 'ModbusSlaveSim',
  components: {
    CommPort,
  },
  computed: {
    ...mapGetters([
      'commPorts',
    ]),
  },
  data() {
    return {
    };
  },
};
</script>
