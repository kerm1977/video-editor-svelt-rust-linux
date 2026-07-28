<script lang="ts">
  import Icon from './Icon.svelte';

  export let icon: string;
  export let label = '';
  export let active = false;
  export let disabled = false;
  export let danger = false;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let onClick: () => void = () => {};
</script>

<button
  class="ib {size}"
  class:active
  class:danger
  title={label}
  aria-label={label}
  {disabled}
  on:click={onClick}
>
  <Icon name={icon} size={size === 'lg' ? 22 : size === 'sm' ? 15 : 18} />
  {#if $$slots.default}<span class="txt"><slot /></span>{/if}
</button>

<style>
  .ib {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 7px;
    border-radius: var(--radius-sm);
    color: var(--txt-1);
    border: 1px solid transparent;
    transition: background 0.12s, color 0.12s, border-color 0.12s;
  }
  .ib.sm {
    padding: 5px;
  }
  .ib.lg {
    padding: 10px;
  }
  .ib:hover:not(:disabled) {
    background: var(--bg-3);
    color: var(--txt-0);
  }
  .ib.active {
    color: var(--accent);
    background: var(--accent-soft);
    border-color: rgba(245, 158, 11, 0.35);
  }
  .ib.danger:hover:not(:disabled) {
    color: var(--danger);
    background: rgba(239, 68, 68, 0.12);
  }
  .ib:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .txt {
    font-size: 12px;
    padding-right: 4px;
  }
</style>
