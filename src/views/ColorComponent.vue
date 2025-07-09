<template>
  <span class="block" :style="{'background': expert.color}"></span>
</template>
<script>
export default {
  name: 'ColorComponent',
  props: {
    expert: {}
  }
}
</script>

<style scoped>
</style>