<template>
<v-card flat>
  <v-card-text>
    <v-layout row wrap>
      <v-flex xs6>
        <v-text-field
         label="Slave Address"
         v-model="slaveAddress"
         />
      </v-flex>
    </v-layout>
    <v-layout row wrap>
    </v-layout>
  </v-card-text>
</v-card>
</template>

<script>
export default {
  name: 'ModbusSlave',
  props: {
    slave: { type: Object },
  },
  computed: {
    slaveAddress: {
      get() {
        return this.slave.address;
      },
      set(value) {
        const address = parseInt(value, 10);

        if (Number.isNaN(address)) return;

        this.$store.commit('SLAVE_UPDATE_ADDRESS', { address, slave: this.slave });
      },
    },
  },
};
</script>

<style>
</style>
