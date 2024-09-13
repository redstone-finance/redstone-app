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
    const { cryptos, networks, page, sortBy, sortDesc, perPage, search } =
      this.$route.query;
    this.selectedCryptos = search ? [] : cryptos ? cryptos.split(",") : [];
    this.selectedNetworks = search
      ? []
      : networks
        ? networks.split(",").map(Number)
        : [];
    this.currentPage = page ? parseInt(page) : 1;
    this.sortBy = sortBy || "popularity";
    this.sortDesc = sortDesc === "true";
    this.perPage = perPage ? parseInt(perPage) : 32;
    this.applyFilters();
  },
  updateRouteParams() {
    if (this.isInitialLoad) return;
    const query = { ...this.$route.query };

    if (this.searchTerm) {
      query.search = this.searchTerm;
      delete query.cryptos;
      delete query.networks;
    } else {
      delete query.search;
      if (this.selectedCryptos.length > 0) {
        query.cryptos = this.selectedCryptos.join(",");
      } else {
        delete query.cryptos;
      }
      if (this.selectedNetworks.length > 0) {
        query.networks = this.selectedNetworks.join(",");
      } else {
        delete query.networks;
      }
    }

    query.page = this.currentPage.toString();
    query.sortBy = this.sortBy;
    query.sortDesc = this.sortDesc.toString();
    query.perPage = this.perPage.toString();

    this.$router.replace({ query }).catch((err) => {
      if (err.name !== "NavigationDuplicated") {
        throw err;
      }
    });
  },
  handleFilter(filterType, value) {
    if (filterType === "cryptos") {
      this.selectedCryptos = value;
    } else if (filterType === "networks") {
      this.selectedNetworks = value;
    }
    if (!this.isInitialLoad) {
      this.currentPage = 1;
    }
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
    this.filters.networks = null;
    this.filters.cryptos = null;
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
