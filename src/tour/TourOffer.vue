<script setup lang="ts">
/**
 * The first-visit offer of a guided tutorial: one card, asked once. Desktop: bottom right, the
 * page not dimmed. Phone: along the bottom. `enabled` is the front's own condition (signed in,
 * on a screen with the frame); the card also hides while a tour runs and once answered.
 */
import { computed } from 'vue'
import { LucideRoute } from '@lucide/vue'
import { useIsPhone } from '../display'
import type { TourMemory } from './memory'

const props = defineProps<{
  /** Any front's engine: only what the offer reads (it does not depend on the front's steps). */
  engine: { state: { id: string | null }; memory: TourMemory; answerOffer: (take: boolean) => Promise<void> }
  enabled: boolean
  labels: { title: string; text: string; yes: string; no: string }
}>()

const phone = useIsPhone()
const shown = computed(() => props.enabled && !props.engine.memory.offer && !props.engine.state.id)
</script>

<template>
  <div v-if="shown" class="cq-tour-offer" :class="{ phone }" role="dialog" aria-labelledby="cq-tour-offer-title">
    <div id="cq-tour-offer-title" class="o-t"><LucideRoute :size="20" />{{ labels.title }}</div>
    <p>{{ labels.text }}</p>
    <div class="o-f">
      <button type="button" class="o-btn" @click="engine.answerOffer(false)">{{ labels.no }}</button>
      <button type="button" class="o-btn primary" @click="engine.answerOffer(true)">{{ labels.yes }}</button>
    </div>
  </div>
</template>

<style scoped>
.cq-tour-offer {
  position: fixed; right: 16px; bottom: 16px; z-index: 80; width: 340px; background: var(--cq-white); border: 1px solid var(--cq-n200); padding: 14px 16px 10px;
  font-size: 13px; line-height: 1.5; color: var(--cq-ink); box-shadow: var(--cq-float-shadow);
}
.cq-tour-offer.phone { left: 12px; right: 12px; bottom: 12px; width: auto; }
.o-t { display: flex; gap: 10px; align-items: center; font-weight: 800; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; }
.o-t > svg { color: var(--cq-accent); }
p { margin: 6px 0 0; }
.o-f { display: flex; justify-content: flex-end; gap: 6px; margin-top: 10px; }
.o-btn {
  display: inline-flex; align-items: center; height: 32px; padding: 0 14px; border: 1px solid transparent; background: none; color: var(--cq-ink);
  font: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
}
.o-btn:hover { background: var(--cq-n50); }
.o-btn.primary { background: var(--cq-ink); border-color: var(--cq-ink); color: var(--cq-white); font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.o-btn.primary:hover { background: var(--cq-accent); border-color: var(--cq-accent); color: var(--cq-ink); }
.phone .o-btn { height: 44px; }
</style>
