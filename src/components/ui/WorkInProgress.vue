<template>
  <div class="wip"><h5>Work in progress</h5></div>
</template>

<style lang="scss">
.wip {
  @include flexify(row, center, center);

  background-color: var(--yellow);
  color: black;
  position: fixed;
  width: 1200px;
  height: 100px;
  bottom: 100px;
  text-align: center;
  rotate: -45deg;
  left: calc(100% - 600px);
  padding-right: 200px;
  border: 4px dotted black;
}
</style>
