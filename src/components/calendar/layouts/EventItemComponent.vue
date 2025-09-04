<template>
  <div :id="`eventItem_${event.id}`"
       :ref="`eventItem_${event.id}`"
       class="event" :class="{dark: isColorDark, 'isDragging': isDragging}"
       :style="style"
       data-bs-toggle="tooltip"
       data-bs-placement="top"
       data-bs-html="true"
       :title="tooltipTitle"
       @dblclick="$emit('eventClicked', event)"
       draggable="true"
       v-on:dragstart="onDragStart($event, event)"
       v-on:dragend="isDragging = false"
       v-resizable.b
       @resize="onResize"
  >
    <span v-html="label"></span>
  </div>

</template>
<script>

import { Tooltip } from 'bootstrap'

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
    }
  },

  data() {
    return {
      modal: null,
      isDragging: false,
      resizeTimeout: null
    }
  },

  computed: {

    label() {
      let text = ''

      text += this.event.id + ' <b>' + this.event.procedure.name + '</b>  <br>'

      text += '<b>' + this.$dayjs(this.event.reservationStartTime.date).format('HH:mm') + '</b> '

      text += this.event.name + ' ' + this.event.surname + ' <br>'

      return text
    },

    tooltipTitle() {
      let text = '<span style=\'text-align: left\'>'
      text += this.event.id + ' <b>' + this.event.procedure.name + '</b>  <br>'
      text += '<b>' + this.$dayjs(this.event.reservationStartTime.date).format('HH:mm') + '</b> '
      text += this.event.name + ' ' + this.event.surname + ' <br>'
      text += 'lenght: ' + this.event.reservationLength + ' min <br>'
      text += 'status: ' + this.event.status + ' <br>'
      text += '</span>'
      return text
    },

    coordinates() {

      let timeParts = this.options.dayStartHour.split(':')
      let dayStart = this.day.clone().hour(timeParts[0]).minute(timeParts[1])


      let scheduleStart = this.$dayjs(this.event.reservationStartTime.date)
      let scheduleHeight = this.event.reservationLength * this.pixelPerMinute

      let start = scheduleStart.diff(dayStart, 'minutes') * this.pixelPerMinute

      return {
        start: start,
        height: scheduleHeight
      }
    },

    isColorDark() {
      //detect if this color is dark or light
      let hexCode = this.event.color
      hexCode.replace('#', '')
      let r = parseInt(hexCode.substr(1, 2), 16)
      let g = parseInt(hexCode.substr(3, 2), 16)
      let b = parseInt(hexCode.substr(5, 2), 16)
      let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
      return yiq <= 128
    },

    style() {
      return {
        top: this.coordinates.start + 'px',
        height: this.coordinates.height + 'px',
        width: this.columnWidth - (this.isDragging ? 5 : 0) + 'px',
        left: (this.scheduleListOrder * this.columnWidth + (this.isDragging ? 5 : 0)) + 'px',
        'background-color': this.event.procedure.color || 'red'
      }
    }

  },

  methods: {

    onDragStart(event, eventData) {
      eventData['type']= 'event';
      this.isDragging = true
      eventData.layoutX = event.layerX
      eventData.layoutY = event.layerY
      event.dataTransfer.setData('application/json', JSON.stringify(eventData))
      //set cursor position to the top left corner of the dragged element
      event.dataTransfer.setDragImage(this.$refs[`eventItem_${this.event.id}`].html, 0, 0)
      console.log(this.$refs[`eventItem_${this.event.id}`].html)
    },


    onResize(event) {
      let newLength = event.target.offsetHeight
      let newLengthInMinutes = Math.round((newLength / this.pixelPerMinute) / this.options.hourGridMinutes) * this.options.hourGridMinutes

      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout)
      }

      this.resizeTimeout = setTimeout(() => {
        this.$emit('appResized', { event: this.event, newLength: newLengthInMinutes })
      }, 1000)
    }


  },

  mounted() {
    new Tooltip(document.body, {
      selector: '[data-bs-toggle=\'tooltip\']'
    })
  },
  emits: ['dragging']
}
</script>
<style>

</style>
