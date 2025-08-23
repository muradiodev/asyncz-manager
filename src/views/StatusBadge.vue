<template>
  <span v-if="status" class="badge bg-success">{{ $t('statusBadge.active') }}</span>
  <span v-else class="badge bg-danger">{{ $t('statusBadge.inactive') }}</span>
</template>

<script>
export default {
  name: 'StatusBadge',
  props: {
    status: {
      type: Boolean,
      required: true
    }
  }
}
</script>