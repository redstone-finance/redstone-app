<template>
  <BCard class="border-0">
    <div class="d-flex align-items-center justify-content-between">
      <div>
        Fetch the token price with just one line of code using
        <a
          target="_blank"
          href="https://github.com/redstone-finance/redstone-api"
        >
          RedStone API
        </a>
      </div>
      <div>
        <b-button
          class="btn-danger btn-docs rounded-pill"
          target="_blank"
          href="https://api.docs.redstone.finance/"
          variant="primary"
          >Check documentation</b-button
        >
      </div>
    </div>

    <hr />

    <iframe
      v-if="shouldLoadCodeBox"
      src="https://codesandbox.io/embed/limestone-api-demo-0h4oo?fontsize=14&hidenavigation=1&theme=dark"
      style="
        width: 100%;
        height: 500px;
        border: 0;
        border-radius: 4px;
        overflow: hidden;
      "
      title="limestone-api-demo"
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
    ></iframe>
    <b-alert v-else show variant="warning">
      CodeBox displaying is disabled in dev environment. It made a mess in
      console.
    </b-alert>
  </BCard>
</template>

<script>
  export default {
    name: "CodeExample",

    computed: {
      shouldLoadCodeBox() {
        return process.env.NODE_ENV === "production";
        // return process.env.NODE_ENV === 'development';
      },
    },
  };
</script>

<style lang="scss">
  @import "../../styles/app";

.btn-docs {
  font-size: $font-size-mini;

  @media (min-width: breakpoint-min(md)) {
    font-size: $font-size-larger;
  }
}
</style>
