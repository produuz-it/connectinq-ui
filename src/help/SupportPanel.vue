<script setup lang="ts">
/**
 * The panel behind the one button for notifications, help and tickets: a drawer on the right
 * (full screen on a phone) with three tabs, **Notifications**, **Help** and **New ticket**.
 *
 * - It always opens on Notifications, unless the front asks for another tab when it opens it
 *   (`startTab`, such as the ticket a notification was about).
 * - Help is the front's book (HelpBook), opened on the chapter of the screen the person is on,
 *   with the front's tutorials when it fills the `tutorials` slot.
 * - New ticket is the form (TicketForm) and, under it, the person's own tickets. The tab reads
 *   *New ticket* in every front and language (`NEW_TICKET`): the same action everywhere, and a
 *   *ticket*, never an *issue*, so it is not taken for an issue of the product itself.
 *
 * The front loads the notifications and the tickets when the panel opens (`opened`), words them,
 * and reacts to `notification-open`, `read-all`, `news-seen` and `ticket-sent`. The panel makes
 * no call of its own. A native <dialog> opened with `showModal()`; a click on the backdrop closes it.
 */
import { computed, onMounted, ref, watch } from 'vue'
import { LucideX } from '@lucide/vue'
import { useIsPhone } from '../display'
import HelpBook from './HelpBook.vue'
import NotificationList from './NotificationList.vue'
import TicketForm, { type TicketLabels } from './TicketForm.vue'
import type { HelpBook as Book, NotificationRow, ReportContext, ReportDraft, TicketRow } from './index'

export type SupportTab = 'notifications' | 'help' | 'ticket'

export interface SupportLabels extends TicketLabels {
  /** The panel's name, also the button's tooltip. */
  title: string
  close: string
  notifications: string
  help: string
  contents: string
  tutorials: string
  /** The notifications' words. */
  none: string
  loading: string
  readAll: string
  unread: string
}

const props = withDefaults(defineProps<{
  labels: SupportLabels
  book: Book
  /** The chapter of the screen the person is on. */
  chapter?: string
  /** The chapter of what is new: opening it emits `news-seen`. */
  newsChapter?: string
  imageUrl?: (name: string) => string
  notifications: NotificationRow[]
  notificationsLoading?: boolean
  notificationsError?: string
  notificationsMore?: string
  /** Sends a ticket; without it there is no New ticket tab. */
  send?: (draft: ReportDraft, context: ReportContext) => Promise<void>
  context?: () => ReportContext
  tickets?: TicketRow[]
  focusTicket?: string
  /** The tab to open on next time; Notifications when not given. */
  startTab?: SupportTab
}>(), {
  chapter: undefined, newsChapter: undefined, imageUrl: undefined, notificationsLoading: false, notificationsError: undefined,
  notificationsMore: undefined, send: undefined, context: undefined, tickets: undefined, focusTicket: undefined, startTab: undefined,
})

/** The name of the ticket tab, the same in every front and language. */
const NEW_TICKET = 'New ticket'

const emit = defineEmits<{
  opened: []
  'notification-open': [key: string]
  'read-all': []
  'news-seen': []
  'ticket-sent': []
}>()
const open = defineModel<boolean>({ default: false })
const tab = defineModel<SupportTab>('tab', { default: 'notifications' })

const phone = useIsPhone()
const dialog = ref<HTMLDialogElement | null>(null)
const chapterView = ref('')

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

watch(open, (isOpen) => {
  if (!isOpen) return
  tab.value = props.startTab && (props.startTab !== 'ticket' || props.send) ? props.startTab : 'notifications'
  const chapters = props.book.chapters
  chapterView.value = props.chapter && chapters.some((c) => c.id === props.chapter) ? props.chapter : (chapters[0]?.id ?? '')
  emit('opened')
}, { immediate: true })

watch([tab, chapterView], ([t, c]) => {
  if (open.value && t === 'help' && props.newsChapter && c === props.newsChapter) emit('news-seen')
})

const tabs = computed(() => [
  { key: 'notifications' as const, label: props.labels.notifications },
  { key: 'help' as const, label: props.labels.help },
  ...(props.send ? [{ key: 'ticket' as const, label: NEW_TICKET }] : []),
])
</script>

<template>
  <dialog ref="dialog" class="cq-support" :class="{ phone }" :aria-label="labels.title" @close="open = false" @click="onBackdrop">
    <div v-if="open" class="sp">
      <header class="sp-head">
        <h2 class="sp-title">{{ labels.title }}</h2>
        <button type="button" class="sp-icon" :title="labels.close" :aria-label="labels.close" @click="open = false">
          <LucideX :size="18" />
        </button>
      </header>
      <nav class="sp-tabs" role="tablist">
        <button v-for="t in tabs" :key="t.key" type="button" role="tab" :class="{ on: tab === t.key, ticket: t.key === 'ticket' }"
                :aria-selected="tab === t.key" @click="tab = t.key">
          {{ t.label }}
        </button>
      </nav>

      <div v-if="tab === 'notifications'" class="sp-body">
        <NotificationList :rows="notifications" :labels="labels" :loading="notificationsLoading" :error="notificationsError"
                          :more="notificationsMore" :phone="phone"
                          @open="(key) => emit('notification-open', key)" @read-all="emit('read-all')" />
      </div>
      <HelpBook v-else-if="tab === 'help'" v-model:view="chapterView" :book="book" :labels="labels" :image-url="imageUrl" :phone="phone">
        <template v-if="$slots.tutorials" #tutorials><slot name="tutorials" /></template>
      </HelpBook>
      <div v-else-if="tab === 'ticket' && send" class="sp-body padded">
        <TicketForm :labels="labels" :send="send" :context="context" :tickets="tickets" :focus="focusTicket" :phone="phone"
                    @sent="emit('ticket-sent')" />
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.cq-support {
  margin: 0 0 0 auto; padding: 0; width: 460px; max-width: 100vw; height: 100dvh; max-height: 100dvh;
  border: 0; border-left: 1px solid var(--cq-n200); background: var(--cq-white); color: var(--cq-ink);
  box-shadow: var(--cq-float-shadow); font-family: var(--cq-font); font-size: 13px; line-height: 1.5;
  text-align: start; text-transform: none; letter-spacing: normal; font-weight: 400; overscroll-behavior: contain;
}
.cq-support.phone { width: 100vw; border-left: 0; box-shadow: none; }
.cq-support::backdrop { background: var(--cq-scrim); }
.sp { position: relative; display: flex; flex-direction: column; height: 100%; min-height: 0; }
.sp-head { flex: none; display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 6px 8px 6px 18px; }
.sp-title { flex: 1; min-width: 0; margin: 0; font-size: 13px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; }
.sp-icon {
  flex: none; display: inline-grid; place-items: center; width: 36px; height: 36px; padding: 0;
  border: 1px solid transparent; background: none; color: var(--cq-ink); cursor: pointer;
}
.sp-icon:hover { background: var(--cq-n50); }
.phone .sp-icon { width: 44px; height: 44px; }
.sp-tabs { flex: none; display: flex; border-bottom: 1px solid var(--cq-n200); }
.sp-tabs button {
  flex: 1 1 auto; height: 42px; padding: 0 10px; border: 0; border-bottom: 3px solid transparent; background: none;
  color: var(--cq-n500); font: inherit; font-size: 11px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
  white-space: nowrap; cursor: pointer;
}
.phone .sp-tabs button { height: 48px; }
.sp-tabs button:hover { color: var(--cq-ink); }
.sp-tabs button.on { color: var(--cq-ink); border-bottom-color: var(--cq-accent); }
.sp-body { flex: 1; min-height: 0; overflow-y: auto; }
.sp-body.padded { padding: 16px 18px 24px; }
</style>
