<script setup lang="ts">
/**
 * A link to another ConnectinQ application, drawn the same way everywhere: the app's mark, a short
 * label and ↗, and a tooltip saying it opens that app in this tab (management app split proposal,
 * section 6.9, D15). Ctrl+click opens a new tab, as any link. Presentation only.
 */
import { LucideArrowUpRight } from '@lucide/vue'

defineProps<{ href: string; label: string; mark: string; title: string }>()
</script>

<template>
  <a class="app-link" :href="href" :title="title"><img :src="mark" alt="" /><span>{{ label }}</span><LucideArrowUpRight :size="13" /></a>
</template>

<style scoped>
.app-link { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 10px; border: 1px solid var(--cq-n100); color: inherit; font-size: 12.5px; text-decoration: none; white-space: nowrap; }
.app-link:hover { border-color: var(--cq-accent); }
.app-link img { width: 16px; height: 16px; object-fit: contain; }
</style>
