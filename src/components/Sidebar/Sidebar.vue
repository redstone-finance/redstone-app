<template>
  <div class="sidebar-wrapper">
    <nav
      :class="{sidebar: true, showSidebar}"
      style="height: 100%;"
    >

      <div class="logo-container">
        <a href="/">
          <div class="logo-image-container">
            <img class="logo-image first" src="/redstone-logo-full.svg" />
          </div>
        </a>
      </div>

      <ul class="nav" >

        <NavLink
            :activeItem="activeItem"
            header="Prices"
            link="/app/tokens"
            iconName="flaticon-prices"
            index="tokens"
            isHeader
        />

        <NavLink
            :activeItem="activeItem"
            header="Providers"
            link="/app/providers"
            iconName="flaticon-providers"
            index="providers"
            isHeader
        />

      </ul>

      <footer class="contentFooter">
        <div class="mb-2">
          Learn more at <a target="_blank" href="https://redstone.finance">our website</a>
        </div>  
        <div class="mb-2">
          Check out our <a target="_blank" href="https://api.docs.redstone.finance" >API documentation</a>
        </div>  
        <div class="mt-2 mb-2">
          <a href="mailto:hello@redstone.finance" class="mr-2"><img width="20px" src="/mail.svg" /></a>
          <a href="https://twitter.com/redstone_defi" class="mr-2" target="_blank"><img width="20px" src="/twitter.svg" /></a>
          <a href="https://github.com/redstone-finance" class="mr-2" target="_blank"><img width="20px" src="/github.svg" /></a>
          <a href="https://discord.com/invite/PVxBZKFr46" target="_blank"><img width="20px" src="/discord.svg" /></a>
        </div>
          © RedStone 2021
      </footer>
    </nav>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import NavLink from './NavLink/NavLink';

export default {
  name: 'Sidebar',
  components: { NavLink },
  data() {
    return {
      alerts: [
        {
          id: 0,
          title: 'Sales Report',
          value: 15,
          footer: 'Calculating x-axis bias... 65%',
          color: 'danger',
        },
        {
          id: 1,
          title: 'Personal Responsibility',
          value: 20,
          footer: 'Provide required notes',
          color: 'primary',
        },
      ],
    };
  },
  methods: {
    ...mapActions('layout', ['changeSidebarActive', 'switchSidebar']),
    setActiveByRoute() {
      const paths = this.$route.fullPath.split('/');
      paths.pop();
      this.changeSidebarActive(paths.join('/'));
    },
  },
  created() {
    this.setActiveByRoute();
  },
  computed: {
    ...mapState('layout', {
      showSidebar: state => state.showSidebar,
      activeItem: state => state.sidebarActiveElement,
    }),
  },
};
</script>

<!-- Sidebar styles should be scoped -->
<style src="./Sidebar.scss" lang="scss" scoped/>
