<template>
  <b-navbar class="header d-print-none app-header">
    <b-nav>
      <b-nav-item>
        <!-- <a class="d-md-down-none px-2" href="#" @click="toggleSidebarMethod" id="barsTooltip">
          <i class='fi flaticon-menu' />
        </a> -->
        <a class="fs-lg d-lg-none" href="#" @click="switchSidebarMethod">
          <i class='fi flaticon-menu' />
        </a>
      </b-nav-item>
    </b-nav>
    <b-nav>
      <b-form class="ml-1" inline>
        <b-form-group style="margin-bottom: 0">
          <b-input-group v-if="showSearchInputInHeader" class="input-group-no-border">
            <template v-slot:prepend>
              <b-input-group-text><i class='fi flaticon-search-2'/></b-input-group-text>
            </template>
            <b-form-input v-model="searchTerm" id="search-input" placeholder="Search Tokens" />
          </b-input-group>
          <a href="/#/app/tokens" v-else>
            <BIconArrowLeft />
            Explore data
          </a>
        </b-form-group>
      </b-form>
    </b-nav>
    <b-nav class="ml-auto">
    </b-nav>
  </b-navbar>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { BIconArrowLeft } from "bootstrap-vue";

export default {
  name: 'Header',
  data() {
    return {};
  },
  created() {
    // Expand sidebar on desktops
    if (window.innerWidth > 1024) {
      this.toggleSidebarMethod();
    }
  },
  computed: {
    ...mapState('layout', ['sidebarClose', 'sidebarStatic', 'showSearchInputInHeader']),

    searchTerm: {
      get() {
        return this.$store.state.layout.searchTerm;
      },
      set(value) {
        this.updateSearchTerm(value);
      },
    },
  },

  methods: {
    ...mapActions('layout', ['toggleSidebar', 'switchSidebar', 'changeSidebarActive', 'updateSearchTerm']),
    switchSidebarMethod() {
      if (!this.sidebarClose) {
        this.switchSidebar(true);
        this.changeSidebarActive(null);
      } else {
        this.switchSidebar(false);
        const paths = this.$route.fullPath.split('/');
        paths.pop();
        this.changeSidebarActive(paths.join('/'));
      }
    },
    toggleSidebarMethod() {
      if (this.sidebarStatic) {
        this.toggleSidebar();
        this.changeSidebarActive(null);
      } else {
        this.toggleSidebar();
        const paths = this.$route.fullPath.split('/');
        paths.pop();
        this.changeSidebarActive(paths.join('/'));
      }
    },
    logout() {
      window.localStorage.setItem('authenticated', false);
      this.$router.push('/login');
    },
  },

  components: {
    BIconArrowLeft,
  },
};
</script>

<style src="./Header.scss" lang="scss"></style>
