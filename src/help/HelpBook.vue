<script setup lang="ts">
/**
 * The chapters of a front's help book: one tab per chapter (and *Tutorials* when the front fills
 * the `tutorials` slot), the open chapter with its sections and a table of contents, and its
 * pictures, which open large. `view` is the open chapter's id or `tutorials`. Drawn inside
 * HelpPanel and SupportPanel.
 */
import { computed, nextTick, ref, watch } from 'vue'
import { helpHtml, type HelpBook } from './index'

const props = withDefaults(defineProps<{
  book: HelpBook
  labels: { contents: string; tutorials: string; close: string }
  imageUrl?: (name: string) => string
  phone?: boolean
}>(), { imageUrl: undefined, phone: false })

const view = defineModel<string>('view', { default: '' })

const body = ref<HTMLElement | null>(null)
const chapters = computed(() => props.book.chapters)
const current = computed(() => chapters.value.find((c) => c.id === view.value) ?? null)

watch(view, async () => {
  await nextTick()
  body.value?.scrollTo({ top: 0 })
})

function goto(sectionId: string) {
  body.value?.querySelector(`#cq-help-${CSS.escape(sectionId)}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const enlarged = ref<{ src: string; caption: string } | null>(null)
const src = (name: string) => (props.imageUrl ? props.imageUrl(name) : name)
</script>

<template>
  <div class="hb" :class="{ phone }">
    <nav class="hb-tabs" :aria-label="labels.contents">
      <button v-for="c in chapters" :key="c.id" type="button" :class="{ on: c.id === view }"
              :aria-current="c.id === view ? 'page' : undefined" @click="view = c.id">
        {{ c.title }}
      </button>
      <button v-if="$slots.tutorials" type="button" :class="{ on: view === 'tutorials' }" @click="view = 'tutorials'">
        {{ labels.tutorials }}
      </button>
    </nav>

    <div ref="body" class="hb-body">
      <template v-if="current">
        <ol v-if="current.sections.length > 1" class="hb-toc">
          <li v-for="s in current.sections" :key="s.id">
            <button type="button" class="hb-link" @click="goto(s.id)">{{ s.title }}</button>
          </li>
        </ol>
        <section v-for="s in current.sections" :id="`cq-help-${s.id}`" :key="s.id" class="hb-section">
          <h3>{{ s.title }}</h3>
          <template v-for="(b, i) in s.blocks" :key="i">
            <p v-if="'p' in b" v-html="helpHtml(b.p)" />
            <ol v-else-if="'steps' in b"><li v-for="(x, j) in b.steps" :key="j" v-html="helpHtml(x)" /></ol>
            <ul v-else-if="'list' in b"><li v-for="(x, j) in b.list" :key="j" v-html="helpHtml(x)" /></ul>
            <p v-else-if="'tip' in b" class="hb-box tip" v-html="helpHtml(b.tip)" />
            <p v-else-if="'note' in b" class="hb-box note" v-html="helpHtml(b.note)" />
            <figure v-else-if="'img' in b" class="hb-figure">
              <button type="button" class="hb-pic" :aria-label="b.caption" @click="enlarged = { src: src(b.img), caption: b.caption }">
                <img :src="src(b.img)" :alt="b.caption" loading="lazy">
              </button>
              <figcaption>{{ b.caption }}</figcaption>
            </figure>
          </template>
        </section>
      </template>
      <slot v-else-if="view === 'tutorials'" name="tutorials" />
    </div>

    <div v-if="enlarged" class="hb-big" role="button" tabindex="0" :aria-label="labels.close"
         @click="enlarged = null" @keydown.enter="enlarged = null">
      <figure>
        <img :src="enlarged.src" :alt="enlarged.caption">
        <figcaption>{{ enlarged.caption }}</figcaption>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.hb { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.hb-tabs { flex: none; display: flex; flex-wrap: wrap; gap: 6px; padding: 12px 18px; border-bottom: 1px solid var(--cq-n100); }
.hb-tabs button {
  height: 30px; padding: 0 10px; border: 1px solid var(--cq-n100); background: var(--cq-white);
  color: var(--cq-ink); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer;
}
.phone .hb-tabs button { height: 40px; }
.hb-tabs button:hover { border-color: var(--cq-ink); }
.hb-tabs button.on { background: var(--cq-ink); border-color: var(--cq-ink); color: var(--cq-white); }
.hb-body { flex: 1; min-height: 0; overflow-y: auto; padding: 16px 18px 24px; }
.hb-toc { margin: 0 0 16px; padding-left: 18px; }
.hb-toc li { margin: 2px 0; }
.hb-link { padding: 0; border: 0; background: none; color: inherit; font: inherit; font-weight: 600; text-align: left;
  text-decoration: underline; text-decoration-color: var(--cq-n300); cursor: pointer; }
.hb-link:hover { color: var(--cq-accent-hover); }
.hb-section { margin-bottom: 22px; scroll-margin-top: 8px; }
.hb-section h3 { margin: 0 0 8px; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.hb-section p { margin: 0 0 10px; }
.hb-section ul, .hb-section ol { margin: 0 0 10px; padding-left: 20px; }
.hb-section li { margin: 2px 0; }
.hb-box { margin: 0 0 10px; padding: 9px 12px; border-left: 3px solid var(--cq-accent); background: var(--cq-n50); }
.hb-box.note { border-left-color: var(--cq-accent-hover); background: var(--cq-warn-tint); color: var(--cq-warn-ink); }
.hb-figure { margin: 0 0 12px; }
.hb-pic { display: block; width: 100%; padding: 0; border: 1px solid var(--cq-n100); background: none; cursor: zoom-in; }
.hb-figure img { display: block; width: 100%; height: auto; }
.hb-figure figcaption, .hb-big figcaption { margin-top: 4px; font-size: 12px; color: var(--cq-n500); }
.hb-big { position: absolute; inset: 0; z-index: 2; display: grid; place-items: center; padding: 16px; background: var(--cq-white); cursor: zoom-out; }
.hb-big figure { margin: 0; }
.hb-big img { display: block; max-width: 100%; max-height: calc(100dvh - 80px); height: auto; }
</style>
