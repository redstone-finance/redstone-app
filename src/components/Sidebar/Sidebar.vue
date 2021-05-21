<template>
  <div class="sidebar-wrapper">
    <nav
        :class="{sidebar: true, sidebarStatic, sidebarClose}"
        style="height: 100%;"
    >

      <div class="logo-container">
        <a target="_blank" href="https://redstone.finance">
          <div class="logo-image-container">
            <img class="logo-image first" src="/redstone-logo.png" />
          </div>
          <div class="logo-text-container">
            <h3>
              <span class="red-text">Red</span><span class="dark-blue-text">Stone</span>
            </h3>
          </div>
        </a>
      </div>

      <ul class="nav" >

        <NavLink
            :activeItem="activeItem"
            header="Tokens"
            link="/app/tokens"
            iconName="flaticon-search-2"
            index="tokens"
            isHeader
        />
        <NavLink
            :activeItem="activeItem"
            header="Arweave"
            link="/app/token/AR"
            imgUrl="/ar-logo.png"
            index="typography"
            isHeader
        />
        <NavLink
            :activeItem="activeItem"
            header="Ethereum"
            link="/app/token/ETH"
            imgUrl="https://cryptoicons.org/api/color/eth/400"
            index="notifications"
            isHeader
        />
        <NavLink
            :activeItem="activeItem"
            header="Bitcoin"
            link="/app/token/BTC"
            imgUrl="https://assets.coingecko.com/coins/images/1/small/bitcoin.png"
            index="tables"
            isHeader
        />


      </ul>

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
    // sidebarMouseEnter() {
    //   if (!this.sidebarStatic && (isScreen('lg') || isScreen('xl'))) {
    //     this.switchSidebar(false);
    //     this.setActiveByRoute();
    //   }
    // },
    // sidebarMouseLeave() {
    //   if (!this.sidebarStatic && (isScreen('lg') || isScreen('xl'))) {
    //     this.switchSidebar(true);
    //     this.changeSidebarActive(null);
    //   }
    // },
  },
  created() {
    this.setActiveByRoute();
  },
  computed: {
    ...mapState('layout', {
      sidebarStatic: state => state.sidebarStatic,
      sidebarOpened: state => !state.sidebarClose,
      sidebarClose: state => state.sidebarClose,
      activeItem: state => state.sidebarActiveElement,
    }),
  },
};
</script>

<!-- Sidebar styles should be scoped -->
<style src="./Sidebar.scss" lang="scss" scoped/>
