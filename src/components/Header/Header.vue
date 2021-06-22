<template>
  <b-navbar class="header d-print-none app-header">
    <b-nav>
      <b-nav-item>
        <!-- <a class="d-md-down-none px-2" href="#" @click="toggleSidebarMethod" id="barsTooltip">
          <i class='fi flaticon-menu' />
        </a> -->
        <a class="fs-lg d-md-none" href="#" @click="toggleSidebarMenu">
          <i class='fi flaticon-menu' />
        </a>
      </b-nav-item>
    </b-nav>
    <b-nav class="w-25 w-md-auto">
      <b-form class="ml-1" inline>
        <b-form-group style="margin-bottom: 0">
          <b-input-group v-if="showSearchInputInHeader" class="input-group-no-border">
            <template v-slot:prepend>
              <b-input-group-text><i class='fi flaticon-search-2'/></b-input-group-text>
            </template>
            <b-form-input v-model="searchTerm" id="search-input" placeholder="Search..." />
          </b-input-group>
          <router-link :to="routerLink" v-else>            
            <BIconArrowLeft />
            Explore data
          </router-link>
        </b-form-group>
      </b-form>
    </b-nav>
    <b-nav class="align-items-center flex-grow-1 justify-content-end">
        <b-button class="btn-lg btn-danger btn-modal rounded-pill" v-b-modal.modal-1 variant="primary">Use our data</b-button>
        <b-modal id="modal-1" title="Code snippet" size="xl" >
          <CodeExample />
          <template #modal-footer ><div></div></template>
        </b-modal>
    </b-nav>
  </b-navbar>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { BIconArrowLeft } from "bootstrap-vue";
import CodeExample from "@/components/Token/CodeExample";

export default {
  name: 'Header',
  data() {
    return {
      search: this.$route.query.search
    };
  },
  computed: {
    ...mapState('layout', ['sidebarClose', 'sidebarStatic', 'showSearchInputInHeader']),

    searchTerm: {
      get() {
        return this.$store.state.layout.searchTerm;
      },
      set(value) {
        this.updateSearchTerm(value);

        if (value) {
          this.$router.push({query: {search: value}})
        } else {
          this.$router.push({query: {}})
        }
      },
    },

    routerLink() {
      let config = { path: '/app/tokens' }
      let searchTerm = this.$store.state.layout.searchTerm;

      if (searchTerm) {
        config.query = { search: searchTerm }
      }
      return config;
    }
  },

  created() {
    this.updateSearchTerm(this.$route.query.search);
  },

  methods: {
    ...mapActions('layout', ['toggleSidebar', 'switchSidebar', 'changeSidebarActive', 'updateSearchTerm']),
    toggleSidebarMenu() {
      this.toggleSidebar();
    },
    logout() {
      window.localStorage.setItem('authenticated', false);
      this.$router.push('/login');
    },
  },

  components: {
    BIconArrowLeft,
    CodeExample
  },
};
</script>

<style src="./Header.scss" lang="scss"></style>
