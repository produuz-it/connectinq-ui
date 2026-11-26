<script setup lang="ts">
/**
 * The conversation about one of the person's tickets, with the team behind the front: the
 * messages, oldest first (the person's own on the right), and a box to write one more while the
 * ticket is open. Opened from the list under TicketForm.
 *
 * The front does the calls: `load` reads the conversation (and is where the front marks it read)
 * and `post` sends a message. While the thread is open it is read again every `pollMs`, unless
 * the page is hidden, so an answer from the team shows up without a reload.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { LucideArrowLeft } from '@lucide/vue'
import type { TicketMessageRow, TicketRow, TicketThread } from './index'

export interface ThreadLabels {
  back?: string
  conversation?: string
  threadEmpty?: string
  threadClosed?: string
  threadFailed?: string
  messageFailed?: string
  writeMessage?: string
  sendMessage?: string
  sending?: string
}

const props = withDefaults(defineProps<{
  labels: ThreadLabels
  row: TicketRow
  load: (key: string) => Promise<TicketThread>
  post: (key: string, text: string) => Promise<void>
  /** How often the open thread is read again, in milliseconds. */
  pollMs?: number
  phone?: boolean
}>(), { pollMs: 10_000, phone: false })

const emit = defineEmits<{ back: []; changed: [] }>()

const words = computed(() => ({
  back: props.labels.back ?? 'Back',
  conversation: props.labels.conversation ?? 'Conversation',
  threadEmpty: props.labels.threadEmpty ?? 'No messages yet. Write to the team about this ticket.',
  threadClosed: props.labels.threadClosed ?? 'This ticket is done; it takes no more messages.',
  threadFailed: props.labels.threadFailed ?? 'The conversation could not be loaded. It is tried again shortly.',
  messageFailed: props.labels.messageFailed ?? 'The message was not sent. Try again.',
  writeMessage: props.labels.writeMessage ?? 'Your message',
  sendMessage: props.labels.sendMessage ?? 'Send',
  sending: props.labels.sending ?? 'Sending…',
}))

const messages = ref<TicketMessageRow[]>([])
const canWrite = ref(false)
const loaded = ref(false)
const failed = ref(false)
const text = ref('')
const state = ref<'idle' | 'sending' | 'failed'>('idle')
const list = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setInterval> | undefined

async function refresh(first = false) {
  try {
    const thread = await props.load(props.row.key)
    const grew = thread.messages.length !== messages.value.length
    messages.value = thread.messages
    canWrite.value = thread.canWrite
    failed.value = false
    if (first || grew) {
      await nextTick()
      list.value?.scrollTo({ top: list.value.scrollHeight })
      // Read (on opening) or grown: the list's counts are stale.
      emit('changed')
    }
  } catch {
    failed.value = true
  } finally {
    loaded.value = true
  }
}

function tick() {
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
  void refresh()
}

onMounted(() => {
  void refresh(true)
  timer = setInterval(tick, props.pollMs)
})
onBeforeUnmount(() => clearInterval(timer))

const canSend = computed(() => text.value.trim().length > 0 && state.value !== 'sending')

async function send() {
  if (!canSend.value) return
  state.value = 'sending'
  try {
    await props.post(props.row.key, text.value.trim())
    text.value = ''
    state.value = 'idle'
    await refresh()
  } catch {
    state.value = 'failed'
  }
}

function onKey(event: KeyboardEvent) {
  // Ctrl or Cmd + Enter sends; Enter alone is a new line.
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault()
    void send()
  }
}
</script>

<template>
  <section class="tt" :class="{ phone }" :aria-label="words.conversation">
    <header class="tt-head">
      <button type="button" class="tt-back" :title="words.back" :aria-label="words.back" @click="emit('back')">
        <LucideArrowLeft :size="16" />
      </button>
      <div class="tt-title">
        <b>{{ row.title }}</b>
        <small>{{ row.kindLabel }} · <span class="mono">{{ row.when }}</span></small>
      </div>
      <span class="tt-chip" :class="row.status">{{ row.statusLabel }}</span>
    </header>

    <div ref="list" class="tt-list" role="log" aria-live="polite">
      <p v-if="loaded && !messages.length && !failed" class="tt-hint">{{ words.threadEmpty }}</p>
      <div v-for="m in messages" :key="m.key" class="tt-msg" :class="{ mine: m.mine }">
        <small><b>{{ m.author }}</b> · <span class="mono">{{ m.when }}</span></small>
        <p>{{ m.text }}</p>
      </div>
    </div>
    <p v-if="failed" class="tt-box note" role="alert">{{ words.threadFailed }}</p>

    <form v-if="canWrite" class="tt-form" @submit.prevent="send">
      <label class="tt-field">
        <span>{{ words.writeMessage }}</span>
        <textarea v-model="text" rows="3" maxlength="4000" @keydown="onKey" />
      </label>
      <p v-if="state === 'failed'" class="tt-box note" role="alert">{{ words.messageFailed }}</p>
      <div class="tt-foot">
        <button type="submit" class="tt-btn primary" :disabled="!canSend">
          {{ state === 'sending' ? words.sending : words.sendMessage }}
        </button>
      </div>
    </form>
    <p v-else-if="loaded && !failed" class="tt-box">{{ words.threadClosed }}</p>
  </section>
</template>

<style scoped>
.tt { display: flex; flex-direction: column; gap: 12px; min-height: 0; }
.tt-head { display: flex; align-items: flex-start; gap: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--cq-n100); }
.tt-back {
  flex: none; display: inline-grid; place-items: center; width: 32px; height: 32px; padding: 0;
  border: 1px solid var(--cq-n200); background: var(--cq-white); color: var(--cq-ink); cursor: pointer;
}
.phone .tt-back { width: 44px; height: 44px; }
.tt-back:hover { border-color: var(--cq-ink); }
.tt-title { flex: 1; min-width: 0; line-height: 1.35; }
.tt-title b { display: block; font-size: 13px; overflow-wrap: anywhere; }
.tt-title small { display: block; font-size: 11.5px; color: var(--cq-n500); }
.mono { font-family: var(--cq-mono); }
.tt-chip {
  flex: none; display: inline-flex; align-items: center; height: 20px; padding: 0 7px; white-space: nowrap;
  font-size: 10.5px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
  border: 1px solid currentColor; color: var(--cq-n400);
}
.tt-chip.sent { color: var(--cq-ink); }
.tt-chip.resolved { color: var(--cq-good-ink); }
.tt-list { display: flex; flex-direction: column; gap: 10px; max-height: 52dvh; overflow-y: auto; padding: 2px; }
.tt-hint { margin: 0; font-size: 12px; color: var(--cq-n500); }
.tt-msg { max-width: 85%; align-self: flex-start; padding: 8px 11px; background: var(--cq-n50); border-left: 3px solid var(--cq-n300); }
.tt-msg.mine { align-self: flex-end; background: var(--cq-selected); border-left: 0; border-right: 3px solid var(--cq-accent); }
.tt-msg small { display: block; font-size: 11px; color: var(--cq-n500); }
.tt-msg small b { color: var(--cq-ink); }
.tt-msg p { margin: 3px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.tt-box { margin: 0; padding: 9px 12px; border-left: 3px solid var(--cq-accent); background: var(--cq-n50); font-size: 12px; }
.tt-box.note { border-left-color: var(--cq-accent-hover); background: var(--cq-warn-tint); color: var(--cq-warn-ink); }
.tt-form { display: flex; flex-direction: column; gap: 8px; }
.tt-field { display: flex; flex-direction: column; gap: 4px; }
.tt-field > span { font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.tt-field textarea {
  width: 100%; box-sizing: border-box; padding: 7px 10px; border: 1px solid var(--cq-n200); border-radius: 0;
  background: var(--cq-white); color: var(--cq-ink); font: inherit; font-size: 13px; resize: vertical;
}
.phone .tt-field textarea { font-size: 16px; }
.tt-field textarea:focus-visible { outline: 2px solid var(--cq-accent); outline-offset: -1px; }
.tt-foot { display: flex; justify-content: flex-end; }
.tt-btn {
  display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 14px; border: 1px solid var(--cq-n200);
  background: var(--cq-white); color: var(--cq-ink); font: inherit; font-size: 12px; font-weight: 800;
  letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
}
.phone .tt-btn { height: 44px; padding: 0 16px; }
.tt-btn.primary { background: var(--cq-ink); border-color: var(--cq-ink); color: var(--cq-white); }
.tt-btn.primary:hover:not(:disabled) { background: var(--cq-accent); border-color: var(--cq-accent); color: var(--cq-on-accent); }
.tt-btn:disabled { opacity: 0.45; cursor: default; }
</style>
