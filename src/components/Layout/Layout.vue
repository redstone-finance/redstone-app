<template>
<div :class="[{root: true, showSidebar}, 'sing-dashboard']">
  <Sidebar />
  <div class="wrap">
    <Header />
    <v-touch class="content" @swipe="handleSwipe" :swipe-options="{direction: 'horizontal'}">
      <transition name="router-animation">
        <router-view />
      </transition>
    </v-touch>
  </div>
</div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapState, mapActions } = createNamespacedHelpers('layout');

import Sidebar from '@/components/Sidebar/Sidebar';
import Header from '@/components/Header/Header';

import './Layout.scss';

export default {
  name: 'Layout',
  components: { Sidebar, Header },
  methods: {
    ...mapActions(['switchSidebar', 'handleSwipe', 'changeSidebarActive', 'toggleSidebar'],
    ),
    handleWindowResize() {
      const width = window.innerWidth;

      if (width <= 768) {
        this.switchSidebar(false);
        this.changeSidebarActive(null);
      } else {
        this.switchSidebar(true);
      }
    },
  },
  computed: {
    ...mapState(["showSidebar"]),
  },
  created() {
    this.handleWindowResize();
    window.addEventListener('resize', this.handleWindowResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleWindowResize);
  }
};
</script>

<style src="./Layout.scss" lang="scss" />
