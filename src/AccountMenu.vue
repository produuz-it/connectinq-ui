<script setup lang="ts">
/**
 * The user area at the foot of the menu: the avatar and the name (with an optional badge, such as
 * a level), and a panel with who is signed in, the front's own blocks (default slot), the
 * language, the theme (when the front passes `themes`), and the sign-out. In the rail only the
 * avatar shows. The front passes the texts and reacts to `language`, `theme` and `sign-out`; where
 * a choice is kept and what signing out does are the front's. On a phone (`phone`)
 * the panel is a full-width sheet above the button, which sits at the foot of the drawer.
 */
import { computed } from 'vue'
import { LucideCheck, LucideLogOut, LucideMoon, LucideSun, LucideSunMoon } from '@lucide/vue'
import PopButton from './PopButton.vue'

const props = defineProps<{
  name: string
  /** The avatar's letters; by default the first letters of the first and last word of the name. */
  initials?: string
  /** Lines under the name in the panel: an e-mail address, a company. */
  lines?: string[]
  /** A short tag beside the name, such as a level; `warn` draws it in vermilion. */
  badge?: { label: string; tone?: 'warn' }
  languages: { value: string; label: string }[]
  language: string
  labels: { title: string; language: string; signOut: string; signOutHint?: string; languageNote?: string; theme?: string }
  /** The theme choices, `light`, `dark` and `auto`, with the front's words; without them there is no theme row. */
  themes?: { value: 'light' | 'dark' | 'auto'; label: string }[]
  theme?: string
  /** A failure to show under the languages, in the front's words. */
  error?: string
  /** Signing out has started: the button stops answering. */
  leaving?: boolean
  rail?: boolean
  phone?: boolean
}>()
const emit = defineEmits<{ language: [value: string]; theme: [value: 'light' | 'dark' | 'auto']; 'sign-out': []; open: [] }>()

const THEME_ICONS = { light: LucideSun, dark: LucideMoon, auto: LucideSunMoon }

const initials = computed(() => {
  if (props.initials) return props.initials
  const words = props.name.split(/\s+/).filter(Boolean)
  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? words[words.length - 1]?.[0] ?? '' : ''
  return (first + last).toUpperCase() || '?'
})
</script>

<template>
  <PopButton class="cq-account" :class="{ rail }" :label="labels.title" side="above" :phone="phone" :width="280" @open="emit('open')">
    <template #button>
      <span class="cq-avatar">{{ initials }}</span>
      <template v-if="!rail">
        <span class="cq-who">{{ name }}</span>
        <span v-if="badge" class="cq-badge" :class="badge.tone">{{ badge.label }}</span>
      </template>
    </template>
    <template #default="{ close }">
    <div class="who-card">
      <b>{{ name }}</b>
      <small v-for="line in lines ?? []" :key="line">{{ line }}</small>
    </div>
    <!-- The front's own blocks; `close` closes the panel (before a guided tour, say). -->
    <slot :close="close" />
    <div class="block">
      <div class="pop-head">{{ labels.language }}</div>
      <button v-for="option in languages" :key="option.value" type="button" class="pop-row" :class="{ current: language === option.value }"
              :aria-pressed="language === option.value" @click="emit('language', option.value)">
        <span class="grow">{{ option.label }}</span>
        <LucideCheck v-if="language === option.value" :size="15" />
      </button>
      <p v-if="labels.languageNote" class="text">{{ labels.languageNote }}</p>
      <p v-if="error" class="pop-error">{{ error }}</p>
    </div>
    <div v-if="themes?.length" class="block">
      <div class="pop-head">{{ labels.theme }}</div>
      <div class="themes" role="radiogroup" :aria-label="labels.theme">
        <button v-for="option in themes" :key="option.value" type="button" role="radio" class="theme" :class="{ on: theme === option.value }"
                :aria-checked="theme === option.value" @click="emit('theme', option.value)">
          <component :is="THEME_ICONS[option.value]" :size="15" aria-hidden="true" /> <span>{{ option.label }}</span>
        </button>
      </div>
    </div>
    <div class="block">
      <button type="button" class="pop-row" :disabled="leaving" @click="emit('sign-out')">
        <LucideLogOut :size="16" /> <span class="grow">{{ labels.signOut }}</span>
      </button>
      <p v-if="labels.signOutHint" class="text">{{ labels.signOutHint }}</p>
    </div>
    </template>
  </PopButton>
</template>

<!-- The button is PopButton's own element, which a scoped rule does not reach; the panel is teleported. -->
<style>
.cq-account { width: 100%; min-height: 36px; gap: 8px; padding: 0 6px; justify-content: flex-start; text-align: left; }
.cq-account:hover, .cq-account.on { background: var(--cq-n50); }
.cq-account.rail { width: 40px; height: 40px; padding: 0; justify-content: center; }
.cq-avatar {
  width: 26px; height: 26px; flex: none; background: var(--cq-indigo); color: var(--cq-on-strong); font-size: 10.5px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
.cq-who { flex: 1; min-width: 0; font-size: 13px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cq-badge {
  flex: none; font-size: 10px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; padding: 1px 5px;
  border: 1px solid var(--cq-n300); color: var(--cq-n500);
}
.cq-badge.warn { border-color: var(--cq-accent-hover); color: var(--cq-accent-hover); }
</style>

<style scoped>
.who-card { padding: 12px 14px 10px; line-height: 1.4; }
.who-card b { display: block; font-size: 14px; }
.who-card small { display: block; font-size: 12px; color: var(--cq-n500); overflow-wrap: anywhere; }
.block { border-top: 1px solid var(--cq-n100); padding-bottom: 6px; }
.text { margin: 0; padding: 0 14px 4px; font-size: 11.5px; line-height: 1.45; color: var(--cq-n500); }
.themes { display: flex; margin: 0 14px 6px; border: 1px solid var(--cq-n200); }
.theme {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 32px; padding: 0 6px;
  border: 0; border-right: 1px solid var(--cq-n200); background: var(--cq-white); color: var(--cq-ink); cursor: pointer;
  font: inherit; font-size: 12px; font-weight: 700;
}
.theme:last-child { border-right: 0; }
.theme:hover { background: var(--cq-n50); }
.theme.on { background: var(--cq-ink); color: var(--cq-white); }
@media (max-width: 599px) { .theme { min-height: 44px; } }
</style>
