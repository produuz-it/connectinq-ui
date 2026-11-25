<script setup lang="ts">
/**
 * The help of a front alone, in a drawer on the right (full screen on a phone): the chapters of
 * its book (HelpBook), opened on the one of the screen the person is on, the front's tutorials
 * when it has any (`tutorials` slot), and a ticket form (TicketForm) when the front can send one
 * (`send`), opened from a button in the accent colour at the top of the panel. That button reads
 * NEW TICKET in every front and language (`NEW_TICKET`).
 *
 * A front that shows notifications draws SupportPanel instead, which holds this help as one of
 * its tabs. A native <dialog> opened with `showModal()`; a click on the backdrop closes it.
 */
import { computed, onMounted, ref, watch } from 'vue'
import { LucideMessageSquarePlus, LucideX } from '@lucide/vue'
import { useIsPhone } from '../display'
import HelpBook from './HelpBook.vue'
import TicketForm from './TicketForm.vue'
import type { HelpBook as Book, ReportContext, ReportDraft, TicketRow } from './index'

export interface HelpLabels {
  title: string
  close: string
  contents: string
  tutorials: string
  /** Not used: the form is NEW TICKET everywhere. Kept so older fronts still type-check. */
  report?: string
  reportIntro: string
  issue: string
  suggestion: string
  reportTitle: string
  reportDescription: string
  reportDetails: string
  send: string
  sending: string
  sent: string
  sendAnother: string
  failed: string
  yourTickets?: string
  noTickets?: string
}

const props = withDefaults(defineProps<{
  book: Book
  labels: HelpLabels
  /** The chapter of the screen the person is on; the panel opens on it. */
  chapter?: string
  /** The chapter of what is new: opening it emits `news-seen`. */
  newsChapter?: string
  /** The address of a picture of the book, from its name. */
  imageUrl?: (name: string) => string
  /** Sends a ticket; without it the panel has no ticket form. */
  send?: (draft: ReportDraft, context: ReportContext) => Promise<void>
  /** What the front adds to a ticket: its name, version, the screen, the language. */
  context?: () => ReportContext
  /** The person's own tickets, shown under the form. */
  tickets?: TicketRow[]
}>(), { chapter: undefined, newsChapter: undefined, imageUrl: undefined, send: undefined, context: undefined, tickets: undefined })

/** The name of the ticket form, the same in every front and language. */
const NEW_TICKET = 'New ticket'

const emit = defineEmits<{ 'news-seen': []; 'ticket-sent': [] }>()
const open = defineModel<boolean>({ default: false })
/** What the panel shows: a chapter id, `tutorials` or `report`. */
const view = defineModel<string>('view', { default: '' })

const phone = useIsPhone()
const dialog = ref<HTMLDialogElement | null>(null)

function sync() {
  const el = dialog.value
  if (!el) return
  if (open.value && !el.open) el.showModal()
  else if (!open.value && el.open) el.close()
}
onMounted(sync)
watch(open, sync, { flush: 'post' })
function onBackdrop(event: MouseEvent) {
  if (event.target === dialog.value) open.value = false
}

const chapters = computed(() => props.book.chapters)
const current = computed(() => chapters.value.find((c) => c.id === view.value) ?? null)

watch(open, (isOpen) => {
  if (isOpen && view.value !== 'report' && view.value !== 'tutorials') {
    view.value = (props.chapter && chapters.value.some((c) => c.id === props.chapter)) ? props.chapter
      : (chapters.value[0]?.id ?? (props.send ? 'report' : ''))
  }
}, { immediate: true })

watch(view, (id) => {
  if (props.newsChapter && id === props.newsChapter && open.value) emit('news-seen')
})

/** HelpBook draws chapters and tutorials; the report view is this panel's. */
const bookView = computed({
  get: () => (view.value === 'report' ? '' : view.value),
  set: (value: string) => { view.value = value },
})
</script>

<template>
  <dialog ref="dialog" class="cq-help" :class="{ phone }" :aria-label="labels.title" @close="open = false" @click="onBackdrop">
    <div v-if="open" class="hp">
      <header class="hp-head">
        <div class="hp-titles">
          <div class="hp-kicker">{{ labels.title }}</div>
          <h2 class="hp-title">{{ current ? current.title : view === 'tutorials' ? labels.tutorials : NEW_TICKET }}</h2>
        </div>
        <button v-if="send" type="button" class="hp-new" :class="{ on: view === 'report' }"
                :aria-current="view === 'report' ? 'page' : undefined" @click="view = 'report'">
          <LucideMessageSquarePlus :size="16" aria-hidden="true" />
          <span>{{ NEW_TICKET }}</span>
        </button>
        <button type="button" class="hp-icon" :title="labels.close" :aria-label="labels.close" @click="open = false">
          <LucideX :size="18" />
        </button>
      </header>

      <div v-if="view === 'report' && send" class="hp-body">
        <TicketForm :labels="labels" :send="send" :context="context" :tickets="tickets" :phone="phone" @sent="emit('ticket-sent')" />
      </div>
      <HelpBook v-else v-model:view="bookView" :book="book" :labels="labels" :image-url="imageUrl" :phone="phone">
        <template v-if="$slots.tutorials" #tutorials><slot name="tutorials" /></template>
      </HelpBook>
    </div>
  </dialog>
</template>

<style scoped>
.cq-help {
  margin: 0 0 0 auto; padding: 0; width: 520px; max-width: 100vw; height: 100dvh; max-height: 100dvh;
  border: 0; border-left: 1px solid var(--cq-n200); background: var(--cq-white); color: var(--cq-ink);
  box-shadow: var(--cq-float-shadow); font-family: var(--cq-font); font-size: 13px; line-height: 1.5;
  text-align: start; text-transform: none; letter-spacing: normal; font-weight: 400; overscroll-behavior: contain;
}
.cq-help.phone { width: 100vw; border-left: 0; box-shadow: none; }
.cq-help::backdrop { background: var(--cq-scrim); }
.hp { position: relative; display: flex; flex-direction: column; height: 100%; min-height: 0; }
.hp-head { flex: none; display: flex; align-items: flex-start; gap: 10px; padding: 14px 10px 4px 18px; }
.hp-titles { flex: 1; min-width: 0; }
.hp-kicker { font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--cq-n500); }
.hp-title { margin: 2px 0 0; font-size: 15px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; }
.hp-icon {
  flex: none; display: inline-grid; place-items: center; width: 36px; height: 36px; padding: 0;
  border: 1px solid transparent; background: none; color: var(--cq-ink); cursor: pointer;
}
.hp-icon:hover { background: var(--cq-n50); }
.phone .hp-icon { width: 44px; height: 44px; }
.hp-new {
  flex: none; display: inline-flex; align-items: center; gap: 7px; height: 36px; padding: 0 14px;
  border: 1px solid var(--cq-accent); background: var(--cq-accent); color: var(--cq-on-accent); cursor: pointer;
  font: inherit; font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
  transition: background 0.15s, border-color 0.15s;
}
.hp-new:hover { background: var(--cq-accent-hover); border-color: var(--cq-accent-hover); }
.hp-new.on { background: var(--cq-ink); border-color: var(--cq-ink); color: var(--cq-white); }
.hp-new:focus-visible { outline: 2px solid var(--cq-ink); outline-offset: 2px; }
.phone .hp-new { height: 44px; padding: 0 12px; }
.hp-body { flex: 1; min-height: 0; overflow-y: auto; padding: 16px 18px 24px; border-top: 1px solid var(--cq-n100); margin-top: 8px; }
</style>
