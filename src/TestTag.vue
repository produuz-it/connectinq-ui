<script setup lang="ts">
/**
 * The environment's name on a build that does not talk to production, beside the logo: the
 * same word in every language, so it is not translated.
 */
defineProps<{ show: boolean }>()
</script>

<template>
  <span v-if="show" class="test-tag">TEST</span>
</template>

<style scoped>
.test-tag {
  display: inline-flex; align-items: center; height: 16px; padding: 0 6px; flex: none;
  background: var(--cq-test-tag); color: var(--cq-test-tag-ink); font-size: 11px; font-weight: 700; letter-spacing: 0.08em; line-height: 1; white-space: nowrap;
}
</style>
