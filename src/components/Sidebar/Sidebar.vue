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
            header="Sources"
            link="/app/sources"
            iconName="flaticon-sources"
            index="sources"
            isHeader
        />

        <NavLink
            :activeItem="activeItem"
            header="Data services"
            link="/app/data-services"
            iconName="flaticon-providers"
            index="providers"
            isHeader
        />

        <NavLink
            :activeItem="activeItem"
            header="Onchain feeds"
            link="/app/feeds"
            iconName="flaticon-layers"
            index="feeds"
            isHeader
        />

      </ul>

      <footer class="contentFooter">
        <div class="mb-2">
          Learn more at <a target="_blank" href="https://redstone.finance">our website</a>
        </div>
        <div class="links mt-3 mb-3">
          <a href="mailto:hello@redstone.finance">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1000 1000">
                    <path d="M 900 163C 934 163 962 191 962 225C 962 225 962 305 962 305C 962 305 579 569 579 569C 545 592 521 600 500 600C 479 600 455 592 421 569C 421 569 38 305 38 305C 38 305 38 225 38 225C 38 191 66 163 100 163C 100 163 900 163 900 163M 379 631C 379 631 379 631 379 631C 420 658 459 675 500 675C 541 675 580 658 621 631C 621 631 621 631 621 631C 621 631 962 396 962 396C 962 396 962 800 962 800C 962 834 934 862 900 862C 900 862 100 862 100 862C 66 862 38 834 38 800C 38 800 38 396 38 396C 38 396 379 631 379 631"></path>
            </svg>
          </a>
          <a href="https://twitter.com/redstone_defi" target="_blank">
            <svg class="bi bi-twitter" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16">
                <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"></path>
            </svg>
          </a>
          <a href="https://github.com/redstone-finance" target="_blank">
            <svg width="20" height="20" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)" />
            </svg>
          </a>
          <a href="https://discord.com/invite/PVxBZKFr46" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1000 1000">
                <path d="M 193 42C 193 42 193 42 193 42C 193 42 807 42 807 42C 859 42 901 84 901 136C 901 136 901 958 901 958C 901 958 802 871 802 871C 802 871 747 820 747 820C 747 820 688 765 688 765C 688 765 712 850 712 850C 712 850 193 850 193 850C 141 850 99 808 99 756C 99 756 99 136 99 136C 99 84 141 42 193 42M 429 255C 429 255 429 255 429 255C 422 255 363 257 301 304C 301 304 235 423 235 571C 235 571 274 637 375 640C 375 640 392 620 406 602C 347 585 326 548 326 548C 326 548 330 551 338 556C 339 556 339 557 340 557C 342 558 343 559 344 560C 356 566 367 571 378 575C 396 582 419 590 445 595C 479 601 520 604 564 595C 585 592 607 585 630 576C 646 570 664 561 683 549C 683 549 660 586 600 603C 614 620 630 640 630 640C 731 637 770 571 770 571C 770 423 704 304 704 304C 638 254 576 255 576 255C 576 255 569 263 569 263C 647 287 683 321 683 321C 636 295 589 282 545 277C 512 273 481 274 453 278C 450 278 448 278 445 279C 429 280 390 286 341 308C 324 315 314 321 314 321C 314 321 352 285 435 261C 435 261 430 255 430 255C 430 255 430 255 429 255M 417 426C 417 426 417 426 417 426C 443 426 464 449 464 477C 464 505 443 528 417 528C 391 528 370 505 370 477C 370 449 391 426 417 426M 584 426C 584 426 584 426 584 426C 610 426 631 449 631 477C 631 505 610 528 584 528C 559 528 538 505 538 477C 538 449 558 426 584 426"></path>
            </svg>
          </a>
        </div>
          © RedStone 2024
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
