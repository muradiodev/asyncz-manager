<template>
  <div :id="`blockItem_${block.id}`"
       :ref="`blockItem_${block.id}`"
       class="event" :class="{dark: isColorDark, 'isDragging': isDragging}"
       :style="style"
       data-bs-toggle="tooltip"
       data-bs-placement="top"
       data-bs-html="true"
       :title="tooltipTitle"
       @dblclick="$emit('blockClicked', block)"
       draggable="true"
       v-on:dragstart="onDragStart($event, block)"
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
  name: 'BlockItemComponent',
  props: {
    block: {
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


      text += '<b>' + this.$dayjs(this.block.startTime.date).format('HH:mm') + '</b> <br> '
      text += '<b>' + this.block.comment+ '</b>  <br>'


      return text
    },

    tooltipTitle() {
      let text = '<span style=\'text-align: left\'>'
      text += '<b>' + this.$dayjs(this.block.startTime.date).format('HH:mm') + '</b> <br> '
      text += 'duration: ' + this.block.duration + ' min <br>'
      text += ' <b>' + this.block.comment + '</b>  <br>'
      text += '</span>'
      return text
    },

    coordinates() {

      let timeParts = this.options.dayStartHour.split(':')
      let dayStart = this.day.clone().hour(timeParts[0]).minute(timeParts[1])


      let scheduleStart = this.$dayjs(this.block.startTime.date)
      let scheduleHeight = this.block.duration * this.pixelPerMinute

      let start = scheduleStart.diff(dayStart, 'minutes') * this.pixelPerMinute

      return {
        start: start,
        height: scheduleHeight
      }
    },

    isColorDark() {
      //detect if this color is dark or light
      let hexCode = this.block.color
      hexCode.replace('#', '')
      let r = parseInt(hexCode.substr(1, 2), 16)
      let g = parseInt(hexCode.substr(3, 2), 16)
      let b = parseInt(hexCode.substr(5, 2), 16)
      let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
      return yiq <= 128
    },

    style() {
      const backgroundStyle = `repeating-linear-gradient(
        45deg,
        #e9ecef,
        #e9ecef 8px,
        #dee2e6 8px,
        #dee2e6 16px
      )`

      return {
        top: this.coordinates.start + 'px',
        height: this.coordinates.height + 'px',
        width: this.columnWidth - (this.isDragging ? 5 : 0) + 'px',
        left: (this.scheduleListOrder * this.columnWidth + (this.isDragging ? 5 : 0)) + 'px',
        'background': backgroundStyle,
        'color': this.block.color || '#495057'
      }
    }


  },

  methods: {

    onDragStart(event, eventData) {
      console.log(eventData)
      eventData['type']= 'block';
      this.isDragging = true
      eventData.layoutX = event.layerX
      eventData.layoutY = event.layerY
      event.dataTransfer.setData('application/json', JSON.stringify(eventData))
      //set cursor position to the top left corner of the dragged element
      event.dataTransfer.setDragImage(this.$refs[`blockItem_${this.block.id}`].html, 0, 0)
      console.log(this.$refs[`blockItem_${this.block.id}`].html)
    },


    onResize(event) {
      let newLength = event.target.offsetHeight
      let newLengthInMinutes = Math.round((newLength / this.pixelPerMinute) / this.options.hourGridMinutes) * this.options.hourGridMinutes

      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout)
      }

      this.resizeTimeout = setTimeout(() => {
        this.$emit('blockResized', { block: this.block, newLength: newLengthInMinutes })
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
