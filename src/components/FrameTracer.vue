<template>
<v-dialog v-model="show" fullscreen hide-overlay
 transition="dialog-bottom-transition">
  <v-card dark>
    <v-toolbar dark color="primary">
      <v-btn icon dark @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>Frame Tracer</v-toolbar-title>
    </v-toolbar>

    <v-card-text>
      <v-data-table
       :headers="headers"
       :items="frames"
       class="elevation-1"
       disable-initial-sort
       hide-actions
      >
        <template v-slot:items="props">
          <td width="100px">{{ props.item.type }}</td>
          <td width="150px">{{ portName(props.item.port) }}</td>
          <td>{{ frameString(props.item.frame) }}</td>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'FrameTracer',
  props: {
    show: { type: Boolean },
  },
  computed: {
    ...mapGetters([
      'frames',
    ]),
  },
  methods: {
    portName(port) {
      return `${port.config.type}:${port.config.commParam.port}`;
    },
    frameString(frame) {
      return frame;
    },
  },
  data() {
    return {
      headers: [
        { text: 'Type', value: 'type' },
        { text: 'Port', value: 'port' },
        { text: 'Frame', value: 'frame' },
      ],
    };
  },
};
</script>

<style>
</style>
