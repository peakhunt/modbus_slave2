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
      <v-flex xs12>
        <v-toolbar flat>
          <v-toolbar-title>Registers</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on }">
              <v-btn color="primary" dark class="mb-2" v-on="on">Add New</v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">Add New Registers</span>
              </v-card-title>
              <v-card-text>
                <v-layout wrap>
                  <v-flex xs12>
                    <v-select
                     v-model="addNewDlg.type"
                     :items="registerTypes"
                     label="Register Type"
                    />
                  </v-flex>
                  <v-flex xs12>
                    <v-text-field
                     label="Address"
                     v-model="addNewDlg.address"
                    />
                  </v-flex>
                  <v-flex xs12>
                    <v-text-field
                     label="Description"
                     v-model="addNewDlg.desc"
                    />
                  </v-flex>
                  <v-flex xs12>
                    <v-text-field
                     label="Value"
                     v-model="addNewDlg.value"
                    />
                  </v-flex>
                </v-layout>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" flat @click="dialog = false">Cancel</v-btn>
                <v-btn color="blue darken-1" flat @click="onAddRegisters">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
        <v-data-table
         :headers="headers"
         :items="slave.registerList"
         class="elevation-1"
        >
          <template v-slot:items="props">
            <td>{{ props.item.type }}</td>
            <td>{{ props.item.address }}</td>
            <td>{{ props.item.desc }}</td>
            <td>{{ props.item.value }}</td>
          </template>
        </v-data-table>
      </v-flex>
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
  methods: {
    onAddRegisters() {
      this.$store.dispatch('slaveAddRegister', { slave: this.slave, regCfg: this.addNewDlg });
      this.dialog = false;
    },
  },
  data() {
    return {
      dialog: false,
      headers: [
        { text: 'Type', value: 'type' },
        { text: 'Address', value: 'address' },
        { text: 'Description', value: 'desc' },
        { text: 'Value', value: 'value', sortable: false },
      ],
      items: [],
      registerTypes: [
        'coil',
        'discrete',
        'holding',
        'input',
      ],
      addNewDlg: {
        type: '',
        address: 1,
        desc: '',
        value: 0,
      },
    };
  },
};
</script>

<style>
</style>
