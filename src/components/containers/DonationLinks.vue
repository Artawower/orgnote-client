<template>
  <div class="sponsor">
    <a
      href="https://www.paypal.me/darkawower"
      title="Paypal"
      target="_blank"
      style="line-height: 0"
    >
      <img
        class="block"
        src="https://img.shields.io/badge/paypal-donate-blue.svg"
        alt="Buy Me A Coffee donate button"
      />
    </a>
    <a href="https://patreon.com/artawower" _target="blank">
      <img
        class="block"
        src="https://img.shields.io/badge/patreon-donate-orange.svg"
        alt="Patreon donate button"
      />
    </a>
  </div>
</template>

<style lang="scss" scoped>
.sponsor {
  @include flexify(row, center, center);

  gap: var(--small-gap);
  padding: var(--block-padding-md);
}
</style>
