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
      const currentPath = this.$router.history.current.path;

      if (currentPath === "/" || currentPath === "/app") {
        this.$router.push("/app/tokens");
      }
    },
    methods: {
      ...mapActions("prefetch", ["prefetchAll"]),
    },
  };
</script>

<style src="./styles/theme.scss" lang="scss" />
