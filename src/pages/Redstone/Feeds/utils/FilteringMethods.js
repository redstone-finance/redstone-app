import { processTokenData } from "./FeedsTableDataLayer";
export default {
  onPerPageChange() {
    this.currentPage = 1;
    this.$refs?.tableComponent?.$refs?.selectableTable?.refresh();
    this.updateRouteParams();
  },
  onSelectedPageChange() {
    this.currentPage = this.selectedPage;
    this.updateRouteParams();
  },
  initializeFiltersFromRoute() {
    const routeParams = this.routeParamsHandler.initializeFiltersFromRoute();
    this.selectedCryptos = routeParams.selectedCryptos;
    this.selectedNetworks = routeParams.selectedNetworks;
    this.currentPage = routeParams.currentPage;
    this.sortBy = routeParams.sortBy;
    this.sortDesc = routeParams.sortDesc;
    this.perPage = routeParams.perPage;
    this.$store.dispatch('layout/updateSearchTerm', routeParams.searchTerm);
    this.applyFilters();
  },
  updateRouteParams() {
    this.routeParamsHandler.updateRouteParams({
      searchTerm: this.searchTerm,
      selectedCryptos: this.selectedCryptos,
      selectedNetworks: this.selectedNetworks,
      currentPage: this.currentPage,
      sortBy: this.sortBy,
      sortDesc: this.sortDesc,
      perPage: this.perPage,
    });
  },
  handleFilter(filterType, value) {
    if (filterType === 'cryptos') {
      this.selectedCryptos = value;
      this.$store.dispatch('layout/updateSearchTerm', '');
    } else if (filterType === 'networks') {
      this.selectedNetworks = value;
      this.$store.dispatch('layout/updateSearchTerm', '');
    }
    this.currentPage = 1;
    this.applyFilters();
    this.updateRouteParams();
  },
  handleSort(ctx) {
    this.sortBy = ctx.sortBy;
    this.sortDesc = ctx.sortDesc;
    this.updateRouteParams();
  },
  applyFilters() {
    this.filters = {
      selectedCryptos: this.selectedCryptos,
      selectedNetworks: this.selectedNetworks,
      searchTerm: this.searchTerm,
    };
    this.$nextTick(() => {
      this.$refs.tableComponent?.$refs?.selectableTable?.refresh();
    });
    if (this.hasFilters) {
      this.$store.dispatch("layout/updateFeedsFilterStatus", true);
    }
  },
  resetFilters(clearSearch = true) {
    this.selectedCryptos = [];
    this.selectedNetworks = [];
    if (clearSearch) {
      this.$store.dispatch("layout/updateSearchTerm", "");
      this.filters.searchTerm = "";
    }
    this.filters.selectedNetworks = [];
    this.filters.selectedCryptos = [];
    this.currentFilter = null;
    this.currentPage = 1;
    this.sortBy = "popularity";
    this.sortDesc = false;
    this.$refs.tableComponent?.$refs?.selectableTable?.refresh();
    this.updateRouteParams();
    this.$store.dispatch("layout/updateFeedsFilterStatus", false);
  },
  onPageChange(page) {
    this.currentPage = page;
    this.updateRouteParams();
  },
  onFiltered(filteredItems) {
    this.filteredItems = filteredItems;
  },
  tokenInNetwork(token, networkId) {
    return processTokenData(this.tokensInNetworks).some(
      (item) => item.network === networkId
    );
  },
  removeCrypto(item) {
    this.selectedCryptos = this.selectedCryptos.filter(
      (crypto) => crypto != item
    );
    this.handleFilter("cryptos", this.selectedCryptos);
    this.updateRouteParams();
  },
  removeNetwork(item) {
    this.selectedNetworks = this.selectedNetworks.filter(
      (network) => network != item
    );
    this.handleFilter("networks", this.selectedNetworks);
    this.updateRouteParams();
  },
};
