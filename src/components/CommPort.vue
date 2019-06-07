<template>
<v-card dark class="elevation-12">
  <v-toolbar>
    <v-toolbar-title class="text-uppercase">
      {{commPort.config.type}} &nbsp; {{ commPort.config.commParam.port }}
    </v-toolbar-title>
    <v-spacer/>

    <v-toolbar-items>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn flat icon v-on="on" @click="onNewSlave">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>Add New Slave</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn flat icon v-on="on" @click="onDelCommPort">
            <v-icon>clear</v-icon>
          </v-btn>
        </template>
        <span>Delete Comm Port</span>
      </v-tooltip>
    </v-toolbar-items>
  </v-toolbar>

  <v-expansion-panel expand>
    <v-expansion-panel-content>
      <div slot="header" >Config</div>
      <CommPortConfig :commPort="commPort"/>
    </v-expansion-panel-content>
  </v-expansion-panel>
</v-card>
</template>

<script>
import CommPortConfig from './CommPortConfig.vue';

export default {
  name: 'CommPort',
  components: {
    CommPortConfig,
  },
  props: {
    commPort: { type: Object },
  },
  data() {
    return {
    };
  },
  methods: {
    onNewSlave() {
    },
    onDelCommPort() {
      this.$store.dispatch('commPortDel', this.commPort);
    },
  },
};
</script>

<style>
</style>
