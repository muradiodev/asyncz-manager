<template>
  <div
      class="event" :class="{dark: isColorDark}"
      :style="style"
      data-bs-toggle="tooltip"
      data-bs-placement="top"
      data-bs-html="true"
      :title="tooltipTitle"
      @dblclick="$emit('eventClicked', event)"
      draggable="true"
      v-on:dragstart="onDragStart($event, event)"
  >
    <span v-html="label"></span>
  </div>

</template>
<script>

import {Tooltip} from 'bootstrap'

export default {
  name: 'EventItemComponent',
  props: {
    event: {
      type: Object,
      required: true
    },
    pixelPerMinute: {
      type: Number,
      required: true
    },
    columnWidth: {
      type: Number,
      required: true
    },
    scheduleListOrder: {
      type: Number,
      required: true
    },
    day: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      required: true
    },
  },

  data() {
    return {
      modal: null
    }
  },

  computed: {

    label() {
      let text = '';

      text += this.event.id + " <b>" + this.event.procedure.name + "</b>  <br>";

      text += '<b>' + this.$dayjs(this.event.reservationStartTime.date).format('HH:mm') + '</b> ';

      text += this.event.name + ' ' + this.event.surname + ' <br>';

      return text;
    },

    tooltipTitle() {
      let text = '<span style=\'text-align: left\'>';
      text += this.event.id + " <b>" + this.event.procedure.name + "</b>  <br>";
      text += '<b>' + this.$dayjs(this.event.reservationStartTime.date).format('HH:mm') + '</b> ';
      text += this.event.name + ' ' + this.event.surname + ' <br>';
      text += 'lenght: ' + this.event.reservationLength + ' min <br>';
      text += 'status: ' + this.event.status + ' <br>';
      text += '</span>';
      return text;
    },

    coordinates() {

      let timeParts = this.options.dayStartHour.split(':');
      let dayStart = this.day.clone().hour(timeParts[0]).minute(timeParts[1]);


      let scheduleStart = this.$dayjs(this.event.reservationStartTime.date);
      let scheduleHeight = this.event.reservationLength * this.pixelPerMinute

      let start = scheduleStart.diff(dayStart, 'minutes') * this.pixelPerMinute;

      return {
        start: start,
        height: scheduleHeight
      }
    },

    isColorDark() {
      //detect if this color is dark or light
      let hexCode = this.event.color;
      hexCode.replace('#', '');
      let r = parseInt(hexCode.substr(1, 2), 16);
      let g = parseInt(hexCode.substr(3, 2), 16);
      let b = parseInt(hexCode.substr(5, 2), 16);
      let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return yiq <= 128;
    },

    style() {
      return {
        top: this.coordinates.start + 'px',
        height: this.coordinates.height + 'px',
        width: this.columnWidth + 'px',
        left: this.scheduleListOrder * this.columnWidth + 'px',
        'background-color': this.event.color || 'red',
      }
    }

  },

  methods: {

    onDragStart(event, eventData) {
      eventData.layoutX = event.layerX;
      eventData.layoutY = event.layerY;
      event.dataTransfer.setData("application/json", JSON.stringify(eventData));
    },
  },

  mounted() {
    new Tooltip(document.body, {
      selector: "[data-bs-toggle='tooltip']",
    });
  },
  emits: ['dragging']
}
</script>
<style>

.event {
  position: absolute;
  background-color: red;
  opacity: 0.8;
  font-size: 10px;
  overflow: hidden;
  border-radius: 3px;
  padding: 5px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  cursor: pointer;

  &:hover {
    opacity: 1;
  }

  &.dark {
    color: #fff;
  }
}
</style>