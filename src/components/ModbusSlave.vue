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
              <v-btn color="primary" dark class="mb-2"
                     v-on="on"
                     :disabled="runtimeStarted">Add New</v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">Add New Registers</span>
              </v-card-title>
              <v-card-text>
                <v-layout wrap>
                  <v-flex xs12>
                    <v-select
                     v-model="newReg.type"
                     :items="registerTypes"
                     label="Register Type"
                     @change="onSelectRegType"
                    />
                  </v-flex>
                  <v-flex xs12>
                    <v-text-field
                     label="Address"
                     v-model.number="newReg.address"
                     type="number"
                    />
                  </v-flex>
                  <v-flex xs12>
                    <v-text-field
                     label="Description"
                     v-model="newReg.desc"
                    />
                  </v-flex>
                  <v-flex xs12 v-if="newReg.type !== 'coil' && newReg.type !== 'discrete'">
                    <v-text-field
                     label="Value"
                     v-model.number="newReg.value"
                     type="number"
                    />
                  </v-flex>
                  <v-flex xs12 v-if="newReg.type === 'coil' || newReg.type === 'discrete'">
                    <v-select
                     v-model="newReg.value"
                     :items="boolValues"
                     label="Value"
                    />
                  </v-flex>
                </v-layout>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" flat @click="onCancel">Cancel</v-btn>
                <v-btn color="blue darken-1" flat @click="onAddEditRegisters">
                  {{ editMode ? 'Update' : 'Add' }}
                </v-btn>
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
            <td width="100px">{{ props.item.type }}</td>
            <td width="150px">{{ props.item.address }}</td>
            <td>{{ props.item.desc }}</td>
            <td>{{ props.item.value }}</td>

            <td>
              <v-icon small class="mr-2" @click="onEditRegister(props.item)"> mdi-pencil </v-icon>
              <v-icon small @click="onDelRegister(props.item)"
                            :disabled="runtimeStarted"> mdi-delete </v-icon>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>

  </v-card-text>
</v-card>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'ModbusSlave',
  props: {
    slave: { type: Object },
  },
  computed: {
    ...mapGetters([
      'runtimeStarted',
    ]),
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
    onSelectRegType(value) {
      switch (value) {
        case 'coil':
        case 'discrete':
          this.newReg.value = false;
          break;

        default:
          this.newReg.value = 0;
          break;
      }
    },
    onAddEditRegisters() {
      if (this.editMode === false) {
        this.$store.dispatch('slaveAddRegister', { slave: this.slave, regCfg: this.newReg });
      } else {
        this.$store.dispatch('slaveUpdateRegister', {
          slave: this.slave,
          oldReg: this.editReg,
          newReg: this.newReg,
        });
        this.editMode = false;
      }
      this.dialog = false;
    },
    onEditRegister(reg) {
      this.newReg.type = reg.type;
      this.newReg.address = reg.address;
      this.newReg.desc = reg.desc;
      this.newReg.value = reg.value;

      this.editReg = reg;

      this.editMode = true;
      this.dialog = true;
    },
    onDelRegister(reg) {
      this.$store.dispatch('slaveDelRegister', { slave: this.slave, reg });
    },
    onCancel() {
      this.dialog = false;
      this.editMode = false;
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
        { text: 'Actions', value: 'name', sortable: false },
      ],
      boolValues: [true, false],
      registerTypes: [
        'coil',
        'discrete',
        'holding',
        'input',
      ],
      newReg: {
        type: 'coil',
        address: 1,
        desc: '',
        value: false,
      },
      editReg: null,
      editMode: false,
    };
  },
};
</script>

<style>
</style>
