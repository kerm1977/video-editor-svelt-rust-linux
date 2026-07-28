<script lang="ts">
  import { ICONS } from '../ui/icons';

  export let name: string;
  export let size = 18;
  export let stroke = 1.7;
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={stroke}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <path d={ICONS[name] ?? ''} />
</svg>
