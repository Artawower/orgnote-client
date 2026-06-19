import { defineComponent, h, ref } from 'vue';
import type { OrgPropertyEntry } from 'orgnote-api';
import ActionButton from 'src/components/ActionButton.vue';
import AppFlex from 'src/components/AppFlex.vue';
import AppInput from 'src/components/AppInput.vue';
import DatePickerPopover from 'src/components/DatePickerPopover.vue';
import {
  formatBooleanValue,
  formatInactiveOrgDate,
  isTruthyPropertyValue,
  parseTags,
  toCalendarDate,
} from './property-model';

export const truncateValue = (value: string): string =>
  value.length > 42 ? `${value.slice(0, 39)}…` : value;

export const TextValue = defineComponent({
  props: { item: { type: Object as () => OrgPropertyEntry, required: true } },
  emits: ['edit'],
  setup: (props, { emit }) => () =>
    h(
      'span',
      { class: 'property-value', onClick: () => emit('edit') },
      truncateValue(props.item.value || 'Empty'),
    ),
});

const openSafeLink = (url: string): void => {
  if (!URL.canParse(url)) return;
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) return;
  window.open(parsed.toString(), '_blank', 'noopener,noreferrer');
};

export const LinkValue = defineComponent({
  props: { item: { type: Object as () => OrgPropertyEntry, required: true } },
  emits: ['edit'],
  setup: (props, { emit }) => () =>
    h(
      AppFlex,
      { class: 'property-value link-value', start: true, gap: 'sm', onClick: () => emit('edit') },
      () => [
        h('span', truncateValue(props.item.value || 'Empty')),
        props.item.value
          ? h(ActionButton, {
              icon: 'sym_o_open_in_new',
              size: 'sm',
              color: 'fg-muted',
              onClick: (event: MouseEvent) => {
                event.stopPropagation();
                openSafeLink(props.item.value);
              },
            })
          : undefined,
      ],
    ),
});

export const BooleanValue = defineComponent({
  props: {
    item: { type: Object as () => OrgPropertyEntry, required: true },
    readonly: { type: Boolean, default: false },
  },
  emits: ['set'],
  setup: (props, { emit }) => () =>
    h(ActionButton, {
      icon: isTruthyPropertyValue(props.item.value)
        ? 'sym_o_check_box'
        : 'sym_o_check_box_outline_blank',
      size: 'sm',
      color: 'fg',
      disableClickHandling: props.readonly,
      onClick: () => emit('set', formatBooleanValue(!isTruthyPropertyValue(props.item.value))),
    }),
});

export const DateTimeValue = defineComponent({
  props: { item: { type: Object as () => OrgPropertyEntry, required: true } },
  emits: ['set'],
  setup: (props, { emit }) => () =>
    h(
      DatePickerPopover,
      {
        modelValue: toCalendarDate(props.item.value),
        'onUpdate:modelValue': (date: string | undefined) => {
          if (!date) return;
          const formatted = formatInactiveOrgDate(date);
          if (formatted) emit('set', formatted);
        },
      },
      {
        trigger: ({ open }: { open: () => void }) =>
          h(
            AppFlex,
            { class: 'property-value', start: true, onClick: open },
            () => truncateValue(props.item.value || 'Empty'),
          ),
      },
    ),
});

export const TagsValue = defineComponent({
  props: {
    item: { type: Object as () => OrgPropertyEntry, required: true },
    readonly: { type: Boolean, default: false },
  },
  emits: ['remove-tag', 'add-tag'],
  setup: (props, { emit }) => {
    const tagDraft = ref('');
    const commitTag = (): void => {
      emit('add-tag', tagDraft.value);
      tagDraft.value = '';
    };
    return () =>
      h(AppFlex, { class: 'property-value tags-value', start: true, gap: 'xs' }, () => [
        ...parseTags(props.item.value).map((tag) =>
          h(AppFlex, { class: 'tag-chip', start: true, gap: 'xs' }, () => [
            h('span', tag),
            !props.readonly
              ? h(ActionButton, {
                  icon: 'sym_o_close',
                  size: 'xs',
                  color: 'fg-muted',
                  onClick: () => emit('remove-tag', tag),
                })
              : undefined,
          ]),
        ),
        !props.readonly
          ? h(AppInput, {
              modelValue: tagDraft.value,
              'onUpdate:modelValue': (value: string | number | undefined) => {
                tagDraft.value = String(value ?? '');
              },
              class: 'tag-input',
              placeholder: 'tag',
              onKeydown: (event: KeyboardEvent) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                commitTag();
              },
            })
          : undefined,
      ]);
  },
});
