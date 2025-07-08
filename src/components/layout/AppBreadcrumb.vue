<script>
export default {
  name: 'AppBreadcrumb',
  props: {
    breadcrumbs: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<template>
  <nav class="text-sm mb-2" aria-label="Breadcrumb">
    <ol class="list-reset flex">
      <li v-for="(item, index) in breadcrumbs" :key="index" class="flex items-center">
        <router-link v-if="!item.active" :to="item.path" class="text-blue-600 hover:underline">{{ item.name }}</router-link>
        <span v-else class="text-gray-500">{{ item.name }}</span>
        <span v-if="index < breadcrumbs.length - 1" class="mx-2 text-gray-400">/</span>
      </li>
    </ol>
  </nav>
</template>
