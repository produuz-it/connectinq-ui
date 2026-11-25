<script setup lang="ts">
/**
 * A ticket: a problem or a suggestion the person sends to the team behind the front, with what
 * the browser says about where they are (`collectContext`) and what the front adds (`context`),
 * all shown before it is sent. Under the form, when the front passes `tickets`, the person's own
 * tickets with their status. Where a ticket goes is the front's business: the form calls `send`
 * and says whether it worked.
 *
 * It is a *ticket* in every front and language, never an *issue*, so it is not taken for an issue
 * of the product itself.
 */
import { computed, ref } from 'vue'
import { collectContext, type ReportContext, type ReportDraft, type ReportKind, type TicketRow } from './index'

export interface TicketLabels {
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
  /** The head of the person's tickets, and what it says when there are none. */
  yourTickets?: string
  noTickets?: string
}

const props = withDefaults(defineProps<{
  labels: TicketLabels
  send: (draft: ReportDraft, context: ReportContext) => Promise<void>
  context?: () => ReportContext
  /** The person's own tickets, newest first; without it there is no list. */
  tickets?: TicketRow[]
  /** A ticket to show lit, the one a notification was about. */
  focus?: string
  phone?: boolean
}>(), { context: undefined, tickets: undefined, focus: undefined, phone: false })

const emit = defineEmits<{ sent: [] }>()

const kind = ref<ReportKind>('issue')
const title = ref('')
const description = ref('')
const details = ref<ReportContext>({})
const state = ref<'idle' | 'sending' | 'sent' | 'failed'>('idle')

function refreshContext() {
  details.value = collectContext(props.context ? props.context() : {})
}
refreshContext()

const canSend = computed(() => title.value.trim().length > 0 && state.value !== 'sending')

async function submit() {
  if (!canSend.value) return
  refreshContext()
  state.value = 'sending'
  try {
    await props.send({ kind: kind.value, title: title.value.trim(), description: description.value.trim() }, details.value)
    state.value = 'sent'
    emit('sent')
  } catch {
    state.value = 'failed'
  }
}

function another() {
  title.value = ''
  description.value = ''
  state.value = 'idle'
  refreshContext()
}
</script>

<template>
  <div class="tf" :class="{ phone }">
    <form class="tf-form" @submit.prevent="submit">
      <template v-if="state !== 'sent'">
        <p class="tf-hint">{{ labels.reportIntro }}</p>
        <div class="tf-kinds" role="radiogroup">
          <label><input v-model="kind" type="radio" value="issue">{{ labels.issue }}</label>
          <label><input v-model="kind" type="radio" value="suggestion">{{ labels.suggestion }}</label>
        </div>
        <label class="tf-field">
          <span>{{ labels.reportTitle }}</span>
          <input v-model="title" type="text" maxlength="200" required>
        </label>
        <label class="tf-field">
          <span>{{ labels.reportDescription }}</span>
          <textarea v-model="description" rows="6" maxlength="10000" />
        </label>
        <details class="tf-details">
          <summary>{{ labels.reportDetails }}</summary>
          <dl>
            <template v-for="(value, key) in details" :key="key">
              <dt>{{ key }}</dt><dd>{{ value }}</dd>
            </template>
          </dl>
        </details>
        <p v-if="state === 'failed'" class="tf-box note" role="alert">{{ labels.failed }}</p>
        <div class="tf-foot">
          <button type="submit" class="tf-btn primary" :disabled="!canSend">
            <span v-if="state === 'sending'" class="tf-spinner" />{{ state === 'sending' ? labels.sending : labels.send }}
          </button>
        </div>
      </template>
      <template v-else>
        <p class="tf-box tip" role="status">{{ labels.sent }}</p>
        <div class="tf-foot"><button type="button" class="tf-btn" @click="another">{{ labels.sendAnother }}</button></div>
      </template>
    </form>

    <section v-if="tickets" class="tf-list">
      <h3>{{ labels.yourTickets }}</h3>
      <p v-if="!tickets.length" class="tf-hint">{{ labels.noTickets }}</p>
      <div v-for="row in tickets" :key="row.key" class="tf-row" :class="{ lit: row.key === focus }">
        <div class="tf-main">
          <b>{{ row.title }}</b>
          <small><span>{{ row.kindLabel }}</span> · <span class="mono">{{ row.when }}</span></small>
          <small v-if="row.reply" class="tf-reply">{{ row.reply }}</small>
        </div>
        <span class="tf-chip" :class="row.status">{{ row.statusLabel }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.tf { display: flex; flex-direction: column; gap: 22px; }
.tf-form { display: flex; flex-direction: column; gap: 14px; }
.tf-hint { margin: 0; font-size: 12px; color: var(--cq-n500); }
.tf-kinds { display: flex; flex-wrap: wrap; gap: 6px 18px; }
.tf-kinds label { display: inline-flex; align-items: center; gap: 8px; min-height: 34px; cursor: pointer; }
.phone .tf-kinds label { min-height: 44px; }
.tf-kinds input { width: 16px; height: 16px; margin: 0; accent-color: var(--cq-accent); }
.tf-field { display: flex; flex-direction: column; gap: 4px; }
.tf-field > span { font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.tf-field input, .tf-field textarea {
  width: 100%; box-sizing: border-box; padding: 7px 10px; border: 1px solid var(--cq-n200); border-radius: 0;
  background: var(--cq-white); color: var(--cq-ink); font: inherit; font-size: 13px;
}
.tf-field input { height: 34px; }
.phone .tf-field input { height: 44px; font-size: 16px; }
.phone .tf-field textarea { font-size: 16px; }
.tf-field textarea { resize: vertical; }
.tf-field input:focus-visible, .tf-field textarea:focus-visible { outline: 2px solid var(--cq-accent); outline-offset: -1px; }
.tf-details summary { font-size: 12px; color: var(--cq-n500); cursor: pointer; }
.tf-details dl { display: grid; grid-template-columns: max-content 1fr; gap: 2px 12px; margin: 8px 0 0; font-family: var(--cq-mono); font-size: 11px; }
.tf-details dt { color: var(--cq-n500); }
.tf-details dd { margin: 0; overflow-wrap: anywhere; }
.tf-box { margin: 0; padding: 9px 12px; border-left: 3px solid var(--cq-accent); background: var(--cq-n50); }
.tf-box.note { border-left-color: var(--cq-accent-hover); background: var(--cq-warn-tint); color: var(--cq-warn-ink); }
.tf-foot { display: flex; justify-content: flex-end; gap: 8px; }
.tf-btn {
  display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 14px; border: 1px solid var(--cq-n200);
  background: var(--cq-white); color: var(--cq-ink); font: inherit; font-size: 12px; font-weight: 800;
  letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
}
.phone .tf-btn { height: 44px; padding: 0 16px; }
.tf-btn:hover:not(:disabled) { border-color: var(--cq-ink); }
.tf-btn.primary { background: var(--cq-ink); border-color: var(--cq-ink); color: var(--cq-white); }
.tf-btn.primary:hover:not(:disabled) { background: var(--cq-accent); border-color: var(--cq-accent); color: var(--cq-on-accent); }
.tf-btn:disabled { opacity: 0.45; cursor: default; }
.tf-spinner { width: 14px; height: 14px; border: 2px solid var(--cq-n500); border-top-color: var(--cq-white); border-radius: 50%;
  animation: tf-spin 0.8s linear infinite; }
@keyframes tf-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .tf-spinner { animation: none; } }

.tf-list { border-top: 1px solid var(--cq-n100); padding-top: 14px; }
.tf-list h3 { margin: 0 0 8px; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--cq-accent-hover); }
.tf-row { display: flex; align-items: flex-start; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--cq-n100); }
.tf-row.lit { background: var(--cq-selected); box-shadow: inset 3px 0 0 var(--cq-accent); padding-left: 8px; }
.tf-main { flex: 1; min-width: 0; line-height: 1.35; }
.tf-main b { display: block; font-size: 13px; overflow-wrap: anywhere; }
.tf-main small { display: block; font-size: 11.5px; color: var(--cq-n500); }
.tf-main .mono { font-family: var(--cq-mono); }
.tf-reply { margin-top: 4px; color: var(--cq-ink) !important; }
.tf-chip {
  flex: none; display: inline-flex; align-items: center; height: 20px; padding: 0 7px; white-space: nowrap;
  font-size: 10.5px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
  border: 1px solid currentColor; color: var(--cq-n400);
}
.tf-chip.sent { color: var(--cq-ink); }
.tf-chip.resolved { color: var(--cq-good-ink); }
</style>
