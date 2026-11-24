<script setup lang="ts">
/**
 * The help of a front, in a drawer on the right (full screen on a phone): the chapters of its
 * book, opened on the one of the screen the person is on, the front's tutorials when it has any
 * (`tutorials` slot), and a form to report an issue or a suggestion when the front can send one
 * (`send`). The form opens from a button in the accent colour at the top of the panel, beside
 * Close, so it is found without reading the chapters. That button reads NEW ISSUE in every front
 * and every language (`NEW_ISSUE`): it is the same action everywhere, so it has one name.
 *
 * The report goes with what the browser says about where the person is (`collectContext`) and
 * what the front adds (`context`); the form shows it all before it is sent. Where it goes is the
 * front's business: the panel calls `send` and says whether it worked.
 *
 * Self-contained like the frame: it draws right in a front that loads only `tokens.css`. It is a
 * native <dialog> opened with `showModal()` (focus moves in and back, Escape closes it); a click
 * on the backdrop closes it too.
 */
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { LucideMessageSquarePlus, LucideX } from '@lucide/vue'
import { useIsPhone } from '../display'
import { collectContext, helpHtml, type HelpBook, type ReportContext, type ReportDraft, type ReportKind } from './index'

export interface HelpLabels {
  title: string
  close: string
  contents: string
  tutorials: string
  /** Not used: the form is NEW ISSUE everywhere. Kept so older fronts still type-check. */
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
}

const props = withDefaults(defineProps<{
  book: HelpBook
  labels: HelpLabels
  /** The chapter of the screen the person is on; the panel opens on it. */
  chapter?: string
  /** The chapter of what is new: opening it emits `news-seen`. */
  newsChapter?: string
  /** The address of a picture of the book, from its name. */
  imageUrl?: (name: string) => string
  /** Sends a report; without it the panel has no report form. */
  send?: (draft: ReportDraft, context: ReportContext) => Promise<void>
  /** What the front adds to a report: its name, version, the screen, the language. */
  context?: () => ReportContext
}>(), { chapter: undefined, newsChapter: undefined, imageUrl: undefined, send: undefined, context: undefined })

/** The name of the report form, the same in every front and language. */
const NEW_ISSUE = 'New issue'

const emit = defineEmits<{ 'news-seen': [] }>()
const open = defineModel<boolean>({ default: false })
/** What the panel shows: a chapter id, `tutorials` or `report`. */
const view = defineModel<string>('view', { default: '' })

const phone = useIsPhone()
const dialog = ref<HTMLDialogElement | null>(null)
const body = ref<HTMLElement | null>(null)

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

watch(view, async (id) => {
  if (props.newsChapter && id === props.newsChapter && open.value) emit('news-seen')
  if (id === 'report') refreshContext()
  await nextTick()
  body.value?.scrollTo({ top: 0 })
})

function goto(sectionId: string) {
  body.value?.querySelector(`#cq-help-${CSS.escape(sectionId)}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const enlarged = ref<{ src: string; caption: string } | null>(null)
const src = (name: string) => (props.imageUrl ? props.imageUrl(name) : name)

// ---- the report ---------------------------------------------------------------------
const kind = ref<ReportKind>('issue')
const title = ref('')
const description = ref('')
const details = ref<ReportContext>({})
const state = ref<'idle' | 'sending' | 'sent' | 'failed'>('idle')

function refreshContext() {
  details.value = collectContext(props.context ? props.context() : {})
}

const canSend = computed(() => title.value.trim().length > 0 && state.value !== 'sending')

async function submit() {
  if (!props.send || !canSend.value) return
  refreshContext()
  state.value = 'sending'
  try {
    await props.send({ kind: kind.value, title: title.value.trim(), description: description.value.trim() },
      details.value)
    state.value = 'sent'
  } catch {
    state.value = 'failed'
  }
}

function another() {
  title.value = ''
  description.value = ''
  state.value = 'idle'
}
</script>

<template>
  <dialog ref="dialog" class="cq-help" :class="{ phone }" :aria-label="labels.title" @close="open = false" @click="onBackdrop">
    <div v-if="open" class="hp">
      <header class="hp-head">
        <div class="hp-titles">
          <div class="hp-kicker">{{ labels.title }}</div>
          <h2 class="hp-title">{{ current ? current.title : view === 'tutorials' ? labels.tutorials : NEW_ISSUE }}</h2>
        </div>
        <button v-if="send" type="button" class="hp-new" :class="{ on: view === 'report' }"
                :aria-current="view === 'report' ? 'page' : undefined" @click="view = 'report'">
          <LucideMessageSquarePlus :size="16" aria-hidden="true" />
          <span>{{ NEW_ISSUE }}</span>
        </button>
        <button type="button" class="hp-icon" :title="labels.close" :aria-label="labels.close" @click="open = false">
          <LucideX :size="18" />
        </button>
      </header>

      <nav class="hp-tabs" :aria-label="labels.contents">
        <button v-for="c in chapters" :key="c.id" type="button" :class="{ on: c.id === view }"
                :aria-current="c.id === view ? 'page' : undefined" @click="view = c.id">
          {{ c.title }}
        </button>
        <button v-if="$slots.tutorials" type="button" :class="{ on: view === 'tutorials' }" @click="view = 'tutorials'">
          {{ labels.tutorials }}
        </button>
      </nav>

      <div ref="body" class="hp-body">
        <template v-if="current">
          <ol v-if="current.sections.length > 1" class="hp-toc">
            <li v-for="s in current.sections" :key="s.id">
              <button type="button" class="hp-link" @click="goto(s.id)">{{ s.title }}</button>
            </li>
          </ol>
          <section v-for="s in current.sections" :id="`cq-help-${s.id}`" :key="s.id" class="hp-section">
            <h3>{{ s.title }}</h3>
            <template v-for="(b, i) in s.blocks" :key="i">
              <p v-if="'p' in b" v-html="helpHtml(b.p)" />
              <ol v-else-if="'steps' in b"><li v-for="(x, j) in b.steps" :key="j" v-html="helpHtml(x)" /></ol>
              <ul v-else-if="'list' in b"><li v-for="(x, j) in b.list" :key="j" v-html="helpHtml(x)" /></ul>
              <p v-else-if="'tip' in b" class="hp-box tip" v-html="helpHtml(b.tip)" />
              <p v-else-if="'note' in b" class="hp-box note" v-html="helpHtml(b.note)" />
              <figure v-else-if="'img' in b" class="hp-figure">
                <button type="button" class="hp-pic" :aria-label="b.caption" @click="enlarged = { src: src(b.img), caption: b.caption }">
                  <img :src="src(b.img)" :alt="b.caption" loading="lazy">
                </button>
                <figcaption>{{ b.caption }}</figcaption>
              </figure>
            </template>
          </section>
        </template>

        <slot v-else-if="view === 'tutorials'" name="tutorials" />

        <form v-else-if="view === 'report' && send" class="hp-report" @submit.prevent="submit">
          <template v-if="state !== 'sent'">
            <p class="hp-hint">{{ labels.reportIntro }}</p>
            <div class="hp-kinds" role="radiogroup">
              <label><input v-model="kind" type="radio" value="issue">{{ labels.issue }}</label>
              <label><input v-model="kind" type="radio" value="suggestion">{{ labels.suggestion }}</label>
            </div>
            <label class="hp-field">
              <span>{{ labels.reportTitle }}</span>
              <input v-model="title" type="text" maxlength="200" required>
            </label>
            <label class="hp-field">
              <span>{{ labels.reportDescription }}</span>
              <textarea v-model="description" rows="7" maxlength="10000" />
            </label>
            <details class="hp-details">
              <summary>{{ labels.reportDetails }}</summary>
              <dl>
                <template v-for="(value, key) in details" :key="key">
                  <dt>{{ key }}</dt><dd>{{ value }}</dd>
                </template>
              </dl>
            </details>
            <p v-if="state === 'failed'" class="hp-box note" role="alert">{{ labels.failed }}</p>
            <div class="hp-foot">
              <button type="submit" class="hp-btn primary" :disabled="!canSend">
                <span v-if="state === 'sending'" class="hp-spinner" />{{ state === 'sending' ? labels.sending : labels.send }}
              </button>
            </div>
          </template>
          <template v-else>
            <p class="hp-box tip" role="status">{{ labels.sent }}</p>
            <div class="hp-foot"><button type="button" class="hp-btn" @click="another">{{ labels.sendAnother }}</button></div>
          </template>
        </form>
      </div>

      <div v-if="enlarged" class="hp-big" role="button" tabindex="0" :aria-label="labels.close"
           @click="enlarged = null" @keydown.enter="enlarged = null">
        <figure>
          <img :src="enlarged.src" :alt="enlarged.caption">
          <figcaption>{{ enlarged.caption }}</figcaption>
        </figure>
      </div>
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

.hp-head { flex: none; display: flex; align-items: flex-start; gap: 10px; padding: 14px 10px 10px 18px; }
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
  border: 1px solid var(--cq-accent); background: var(--cq-accent); color: var(--cq-ink); cursor: pointer;
  font: inherit; font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
  transition: background 0.15s, border-color 0.15s;
}
.hp-new:hover { background: var(--cq-accent-hover); border-color: var(--cq-accent-hover); }
.hp-new.on { background: var(--cq-ink); border-color: var(--cq-ink); color: var(--cq-white); }
.hp-new:focus-visible { outline: 2px solid var(--cq-ink); outline-offset: 2px; }
.phone .hp-new { height: 44px; padding: 0 12px; }

.hp-tabs { flex: none; display: flex; flex-wrap: wrap; gap: 6px; padding: 0 18px 12px; border-bottom: 1px solid var(--cq-n100); }
.hp-tabs button {
  height: 30px; padding: 0 10px; border: 1px solid var(--cq-n100); background: var(--cq-white);
  color: var(--cq-ink); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer;
}
.phone .hp-tabs button { height: 40px; }
.hp-tabs button:hover { border-color: var(--cq-ink); }
.hp-tabs button.on { background: var(--cq-ink); border-color: var(--cq-ink); color: var(--cq-white); }

.hp-body { flex: 1; min-height: 0; overflow-y: auto; padding: 16px 18px 24px; }
.hp-toc { margin: 0 0 16px; padding-left: 18px; }
.hp-toc li { margin: 2px 0; }
.hp-link { padding: 0; border: 0; background: none; color: inherit; font: inherit; font-weight: 600; text-align: left;
  text-decoration: underline; text-decoration-color: var(--cq-n300); cursor: pointer; }
.hp-link:hover { color: var(--cq-accent-hover); }
.hp-section { margin-bottom: 22px; scroll-margin-top: 8px; }
.hp-section h3 { margin: 0 0 8px; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.hp-section p { margin: 0 0 10px; }
.hp-section ul, .hp-section ol { margin: 0 0 10px; padding-left: 20px; }
.hp-section li { margin: 2px 0; }
.hp-box { margin: 0 0 10px; padding: 9px 12px; border-left: 3px solid var(--cq-accent); background: var(--cq-n50); }
.hp-box.note { border-left-color: var(--cq-accent-hover); background: var(--cq-warn-tint); color: var(--cq-warn-ink); }
.hp-figure { margin: 0 0 12px; }
.hp-pic { display: block; width: 100%; padding: 0; border: 1px solid var(--cq-n100); background: none; cursor: zoom-in; }
.hp-figure img { display: block; width: 100%; height: auto; }
.hp-figure figcaption, .hp-big figcaption { margin-top: 4px; font-size: 12px; color: var(--cq-n500); }
.hp-big { position: absolute; inset: 0; display: grid; place-items: center; padding: 16px; background: var(--cq-white); cursor: zoom-out; }
.hp-big figure { margin: 0; }
.hp-big img { display: block; max-width: 100%; max-height: calc(100dvh - 80px); height: auto; }

.hp-report { display: flex; flex-direction: column; gap: 14px; }
.hp-hint { margin: 0; font-size: 12px; color: var(--cq-n500); }
.hp-kinds { display: flex; flex-wrap: wrap; gap: 6px 18px; }
.hp-kinds label { display: inline-flex; align-items: center; gap: 8px; min-height: 34px; cursor: pointer; }
.phone .hp-kinds label { min-height: 44px; }
.hp-kinds input { width: 16px; height: 16px; margin: 0; accent-color: var(--cq-accent); }
.hp-field { display: flex; flex-direction: column; gap: 4px; }
.hp-field > span { font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.hp-field input, .hp-field textarea {
  width: 100%; box-sizing: border-box; padding: 7px 10px; border: 1px solid var(--cq-n200); border-radius: 0;
  background: var(--cq-white); color: var(--cq-ink); font: inherit; font-size: 13px;
}
.hp-field input { height: 34px; }
.phone .hp-field input { height: 44px; font-size: 16px; }
.phone .hp-field textarea { font-size: 16px; }
.hp-field textarea { resize: vertical; }
.hp-field input:focus-visible, .hp-field textarea:focus-visible { outline: 2px solid var(--cq-accent); outline-offset: -1px; }
.hp-details summary { font-size: 12px; color: var(--cq-n500); cursor: pointer; }
.hp-details dl { display: grid; grid-template-columns: max-content 1fr; gap: 2px 12px; margin: 8px 0 0; font-family: var(--cq-mono); font-size: 11px; }
.hp-details dt { color: var(--cq-n500); }
.hp-details dd { margin: 0; overflow-wrap: anywhere; }
.hp-foot { display: flex; justify-content: flex-end; gap: 8px; }
.hp-btn {
  display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 14px; border: 1px solid var(--cq-n200);
  background: var(--cq-white); color: var(--cq-ink); font: inherit; font-size: 12px; font-weight: 800;
  letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
}
.phone .hp-btn { height: 44px; padding: 0 16px; }
.hp-btn:hover:not(:disabled) { border-color: var(--cq-ink); }
.hp-btn.primary { background: var(--cq-ink); border-color: var(--cq-ink); color: var(--cq-white); }
.hp-btn.primary:hover:not(:disabled) { background: var(--cq-accent); border-color: var(--cq-accent); }
.hp-btn:disabled { opacity: 0.45; cursor: default; }
.hp-spinner { width: 14px; height: 14px; border: 2px solid var(--cq-n500); border-top-color: var(--cq-white); border-radius: 50%;
  animation: hp-spin 0.8s linear infinite; }
@keyframes hp-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .hp-spinner { animation: none; } }
</style>
