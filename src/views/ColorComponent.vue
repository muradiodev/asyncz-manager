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
.block {
  width: 30px;
  height: 15px;
  display: inline-block;
  border: 1px solid #000;
  border-radius: 5px;
}
</style>