<template>
  <CFooter class="px-4 py-3 bg-light border-top c-footer">
    <div class="d-flex justify-content-between align-items-center w-100">
      <div class="text-muted">
        <span>&copy; {{ new Date().getFullYear() }}</span>
        <a href="https://asyncz.com" target="_blank" class="text-decoration-none text-primary ms-2 fw-medium">
          asyncz
        </a>
      </div>
      <div class="text-muted small">
        Made with ❤️ by
        <a href="https://deviofy.com" target="_blank" class="text-decoration-none text-primary fw-medium">
          Deviofy
        </a>
      </div>
    </div>
  </CFooter>
</template>

<style>

.c-footer {
  margin-top: 10px;
}

</style>
