<script setup lang="ts">
/**
 * A form drawn from one of the platform's form schemas (`GET dynamic_form_settings/<name>/`): each
 * setting has a `name`, a `data_type`, a default, a section, help, options and a suffix. The value
 * is an object by setting name; a setting left unset takes its default on the platform. A label
 * is the front's word for the setting's name when it has one, else the schema's label. Tables and
 * matrices are edited as JSON. Presentation only.
 */
import { computed } from 'vue'

export interface Setting {
  name: string
  data_type: 'bool' | 'int' | 'float' | 'str' | 'text_area' | 'multi_select' | 'table' | 'list_branches' | 'matrix_set' | string
  default_value?: unknown
  section?: string
  label?: string
  help_text?: string
  required?: boolean
  options?: { value: string | number; text: string }[]
  suffix?: string
}

const props = defineProps<{ settings: Setting[]; labelOf: (s: Setting) => string; jsonHint: string; defaultHint: (value: string) => string }>()
const model = defineModel<Record<string, unknown>>({ default: () => ({}) })

const sections = computed(() => {
  const out = new Map<string, Setting[]>()
  for (const s of props.settings) out.set(s.section || '', [...(out.get(s.section || '') ?? []), s])
  return [...out.entries()]
})
const value = (s: Setting) => (s.name in model.value ? model.value[s.name] : s.default_value)
function set(s: Setting, v: unknown) {
  model.value = { ...model.value, [s.name]: v }
}
function setNumber(s: Setting, raw: string) {
  if (raw === '') { const next = { ...model.value }; delete next[s.name]; model.value = next; return }
  set(s, s.data_type === 'int' ? parseInt(raw) : parseFloat(raw))
}
function setJson(s: Setting, raw: string) {
  try { set(s, JSON.parse(raw)) } catch { /* left as it was until it parses */ }
}
const isJson = (s: Setting) => ['table', 'matrix_set'].includes(s.data_type)
const shown = (v: unknown) => (v === undefined || v === null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v))
</script>

<template>
  <div class="df">
    <section v-for="[title, list] in sections" :key="title" class="df-sect">
      <h4 v-if="title" class="micro">{{ title }}</h4>
      <div class="df-grid">
        <template v-for="s in list" :key="s.name">
          <label v-if="s.data_type === 'bool'" class="df-switch full">
            <span class="grow"><b>{{ labelOf(s) }}</b><span v-if="s.help_text" class="hint">{{ s.help_text }}</span></span>
            <input type="checkbox" role="switch" :checked="!!value(s)" @change="set(s, ($event.target as HTMLInputElement).checked)" />
          </label>
          <div v-else-if="s.data_type === 'multi_select'" class="field full"><span class="micro">{{ labelOf(s) }}</span>
            <div class="df-multi"><label v-for="o in s.options" :key="o.value" class="check">
              <input type="checkbox" :checked="Array.isArray(value(s)) && (value(s) as unknown[]).includes(o.value)"
                     @change="set(s, ($event.target as HTMLInputElement).checked ? [...((value(s) as unknown[]) ?? []), o.value] : ((value(s) as unknown[]) ?? []).filter((x) => x !== o.value))" /> {{ o.text }}</label></div>
            <span v-if="s.help_text" class="hint">{{ s.help_text }}</span>
          </div>
          <label v-else class="field" :class="{ full: isJson(s) || s.data_type === 'text_area' }"><span class="micro">{{ labelOf(s) }}<template v-if="s.suffix"> ({{ s.suffix }})</template></span>
            <select v-if="s.options?.length" :value="value(s)" @change="set(s, ($event.target as HTMLSelectElement).value)">
              <option v-if="!s.required" value="">—</option><option v-for="o in s.options" :key="o.value" :value="o.value">{{ o.text }}</option>
            </select>
            <input v-else-if="s.data_type === 'int' || s.data_type === 'float'" type="number" class="mono" :step="s.data_type === 'int' ? 1 : 'any'"
                   :value="s.name in model ? model[s.name] : ''" :placeholder="shown(s.default_value)" @change="setNumber(s, ($event.target as HTMLInputElement).value)" />
            <input v-else-if="s.data_type === 'list_branches'" type="text" :value="Array.isArray(value(s)) ? (value(s) as string[]).join(', ') : ''"
                   @change="set(s, ($event.target as HTMLInputElement).value.split(',').map((x) => x.trim()).filter(Boolean))" />
            <textarea v-else-if="isJson(s) || s.data_type === 'text_area'" :rows="isJson(s) ? 4 : 3" :class="{ mono: isJson(s) }" :value="shown(value(s))"
                      @change="isJson(s) ? setJson(s, ($event.target as HTMLTextAreaElement).value) : set(s, ($event.target as HTMLTextAreaElement).value)" />
            <input v-else type="text" :value="s.name in model ? model[s.name] : ''" :placeholder="shown(s.default_value)" @change="set(s, ($event.target as HTMLInputElement).value)" />
            <span v-if="s.help_text" class="hint">{{ s.help_text }}</span>
            <span v-if="isJson(s)" class="hint">{{ jsonHint }}</span>
            <span v-else-if="s.default_value !== undefined && s.default_value !== '' && !(s.name in model)" class="hint">{{ defaultHint(shown(s.default_value)) }}</span>
          </label>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.df { display: flex; flex-direction: column; gap: 14px; }
.df-sect h4 { margin: 0 0 6px; }
.df-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 16px; }
@media (max-width: 599px) { .df-grid { grid-template-columns: 1fr; } }
.full { grid-column: 1 / -1; }
.df-switch { display: flex; align-items: center; gap: 12px; padding: 6px 0; border-bottom: 1px solid var(--cq-n100); }
.df-switch .grow { display: flex; flex-direction: column; gap: 2px; }
.df-multi { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 12.5px; }
</style>
