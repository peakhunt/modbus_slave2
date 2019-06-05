<template>
<v-card>
  <v-card-title>
    Comm Port View
  </v-card-title>
  <v-card-text>
    <v-layout wrap>
      <v-flex xs12>
        <v-combobox
         v-model="commPort.type"
         :items="commProtocols"
         label="Communication Protocol"
        />
      </v-flex>
    </v-layout>
  </v-card-text>
</v-card>
</template>

<script>
export default {
  name: 'CommPort',
  props: {
    commPort: { type: Object },
  },
  data() {
    return {
      commProtocols: ['rtu', 'tcp'],
    };
  },
};
</script>

<style>
</style>
