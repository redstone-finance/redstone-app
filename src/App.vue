<template>
  <router-view />
</template>

<script>
  import { mapActions } from "vuex";

  export default {
    name: "App",

    beforeMount() {
      // this.initArweave();
      this.prefetchAll();
    },
    methods: {
      ...mapActions("prefetch", ["prefetchAll"]),
    },
  };
</script>

<style src="./styles/theme.scss" lang="scss" />
