<template>
    <div class="layers">
        <div class="layers__actions-wrapper">
            <div>
                <div class="d-flex">
                    <NetworkPicker @input="handleFilter('networks', $event)" v-model="selectedNetworks"
                        :items="networksMap" class="mr-2" />
                    <CryptoPicker :items="cryptoImages" @input="handleFilter('cryptos', $event)"
                        v-model="selectedCryptos" />
                </div>
                <div class="mt-2 d-flex">
                    <CheckboxButton :disabled="!filteredCurrencies.includes(crypto.token)"
                        v-for="crypto in mostUsedCryptos" :key="crypto.token"
                        :isChecked="selectedCryptos.includes(crypto.token)" @change="handleSingleFilterCheckbox"
                        :name="crypto.name" :token="crypto.token" :imageName="crypto.image" />
                </div>
            </div>
            <div class="layers__actions-wrapper-item layers__actions-wrapper-item--right">
                <div class="d-flex align-items-end">
                    <div>
                        <div v-if="hasFilters" class="clear-filters" @click="resetFilters">Clear all</div>
                        <div class="layers__actions-wrapper-label">Status</div>
                        <span class="layers__status-text"><strong>{{ networksMap.length }}</strong> networks
                            available</span>
                        <span class="layers__status-text"><strong>{{ layers.length }}</strong> feeds</span>
                    </div>
                </div>
            </div>
        </div>
        <template>
            <b-table id="layers-table" v-model="displayedTableItems" key="table" stacked="md" ref="selectableTable"
                @filtered="onFiltered" :filter="filters" sort-icon-left hover :items="layers" :per-page="perPage"
                :current-page="currentPage" :filter-function="customFilter" :tbody-tr-class="rowClass" :fields="fields"
                class="layers__table">
                <template #cell(network)="{ item }">
                    <img class="token-image" :src="item.network.image">
                    {{ item.network.name }}
                </template>
                <template #cell(contract_address)="{ item }">
                    <a :title="`Open address in ${item.explorer.name} explorer`" target="_blank"
                        :href="`${item.explorer.explorerUrl}/address/${item.contract_address}`"
                        style="color: var(--redstone-red-color)"> {{
                            truncateString(item.contract_address) }}</a>
                    <span v-b-tooltip.hover @click.prevent="copyToClipboardHelper($event, item.contract_address)"
                        title="Copy to clipboard" class="copy-icon glyphicon glyphicon-book"></span>
                </template>
                <template #cell(feed)="{ item }">
                    <img :src="getImageUrl(item.token_image?.imageName)" class="token-image"> {{ item.feed }}
                </template>
                <template #cell(timestamp)="{ item }">
                    <Loader v-if="item.loaders.blockTimestamp" />
                    <span v-else-if="item.timestamp.raw">
                        <span class="timestamp-date">
                            {{ item.timestamp.date }}
                        </span>
                        {{ item.timestamp.parsed }} ago
                    </span>
                    <span v-else>no-data</span>
                </template>
            </b-table>
            <b-pagination @change="onPageChange" v-model="currentPage" :total-rows="totalRows" :per-page="perPage"
                align="center" class="my-3" style="z-index: 0; position: relative;"></b-pagination>
        </template>
    </div>

</template>

<script>
import _ from "lodash";
import { mapActions, mapGetters, mapState } from 'vuex'
import Loader from '../../../components/Loader/Loader'
import { hexToDate, parseUnixTime } from '../../../core/timeHelpers'
import copyToClipboardHelper from '../../../core/copyToClipboard'
import truncateString from "../../../core/truncate";
import LayerName from './components/LayerName'
import LayerChain from './components/LayerChain'
import LayerPriceFeeds from './components/LayerPriceFeeds'
import LayerTriggers from './components/LayerTriggers'
import CryptoPicker from "./components/CryptoPicker.vue"
import NetworkPicker from "./components/NetworkPicker.vue"
import networkImages from "../../../data/networkImages";
import networks from '@/data/networks.js'
import images from '@/core/logosDefinitions.js'
import explorers from "../../../data/explorers";
import CheckboxButton from "./components/CheckboxButton.vue";

export default {
    components: {
        Loader,
        LayerName,
        LayerChain,
        LayerPriceFeeds,
        LayerTriggers,
        CryptoPicker,
        NetworkPicker,
        CheckboxButton
    },
    data() {
        return {
            selectAll: false,
            displayedTableItems: [],
            selectedItems: [],
            filters: null,
            selectedChain: null,
            selectedCryptos: [],
            selectedNetworks: [],
            perPage: 15,
            currentPage: 1,
            filteredItems: [],
            isUnselecting: false,
            isInitialLoad: true,
            mostUsedCryptos: [
                { name: 'BitCoin', token: 'BTC', image: 'btc.webp' },
                { name: 'Ethereum', token: 'ETH', image: 'eth.webp' },
            ],
            fields: [
                { key: 'feed', label: 'Feed', sortable: true },
                { key: 'network', label: 'Network', sortable: true },
                { key: 'contract_address', label: 'Contract address' },
                { key: 'timestamp', label: 'Last update', sortable: true },
            ],
        };
    },

    async mounted() {
        this.prefetchImages(networkImages)
        await this.init()
        this.initializeFiltersFromRoute()
        this.$nextTick(() => {
            this.isInitialLoad = false // Set to false after initial load
        })
    },
    methods: {
        copyToClipboardHelper,
        truncateString,
        initializeFiltersFromRoute() {
            const { cryptos, networks, page } = this.$route.query;
            console.log({ page })
            this.selectedCryptos = cryptos ? cryptos.split(',') : [];
            this.selectedNetworks = networks ? networks.split(',').map(Number) : [];
            this.currentPage = page ? parseInt(page) : 1;
            this.applyFilters();
        },

        updateRouteParams() {
            if (this.isInitialLoad) return; // Skip update during initial load

            const query = { ...this.$route.query };
            if (this.selectedCryptos.length > 0) {
                query.cryptos = this.selectedCryptos.join(',');
            } else {
                delete query.cryptos;
            }
            if (this.selectedNetworks.length > 0) {
                query.networks = this.selectedNetworks.join(',');
            } else {
                delete query.networks;
            }
            query.page = this.currentPage.toString();

            this.$router.push({ query }).catch(err => {
                if (err.name !== 'NavigationDuplicated') {
                    throw err;
                }
            });
        },

        handleFilter(filterType, value) {
            if (filterType === 'cryptos') {
                this.selectedCryptos = value;
            } else if (filterType === 'networks') {
                this.selectedNetworks = value;
            }
            if (!this.isInitialLoad) {
                this.currentPage = 1; // Reset to first page when filters change, but not on initial load
            }
            this.applyFilters();
            this.updateRouteParams();
        },

        applyFilters() {
            this.filters = {
                selectedCryptos: this.selectedCryptos,
                selectedNetworks: this.selectedNetworks
            };
            this.$refs.selectableTable.refresh();
        },
        onRowClick(item) {
            this.$router.push({ name: 'LayerSinglePage', params: { layerId: item.layer } })
        },
        stripAdditionalFeedInfo(string) {
            const hasUnderscore = string.indexOf('_') >= 0
            const hasDash = string.indexOf('-') >= 0
            if (hasUnderscore) {
                return string.split('_')[0]
            } else if (hasDash) {
                return string.split('-')[0]
            }
            return string
        },
        resetFilters() {
            this.selectedCryptos = [];
            this.selectedNetworks = [];
            this.filters = null;
            this.currentFilter = null;
            this.currentPage = 1;
            this.$refs.selectableTable.refresh();
            this.updateRouteParams();
        },

        onPageChange(page) {
            this.currentPage = page
            this.updateRouteParams();
        },
        handleSingleFilterCheckbox(data) {
            if (!data.isChecked) {
                this.selectedCryptos.push(data.value)
            } else {
                this.selectedCryptos = this.selectedCryptos.filter(token => token != data.value)
            }
            this.handleFilter('crypto', this.selectedCryptos)
        },
        onFiltered(filteredItems) {
            this.filteredItems = filteredItems
            this.clearSelected()
            this.unselectInvalidItems()
        },
        customFilter(row, filters) {
            if (!filters) return true;

            const { selectedCryptos, selectedNetworks } = filters;

            const cryptoMatch = selectedCryptos.length === 0 || selectedCryptos.some(crypto =>
                row.feed.toLowerCase().includes(crypto.toLowerCase())
            );

            const networkMatch = selectedNetworks.length === 0 || selectedNetworks.includes(row.network.id);

            return cryptoMatch && networkMatch;
        },
        findNetworkName(networkId) {
            return Object.values(networks).find(network => network.chainId === networkId).name
        },
        findNetworkImage(networkId) {
            const networkKey = Object.keys(networks).find(key => networks[key].chainId === networkId)
            return networkImages[networkKey]
        },
        findExplorer(networkId) {
            return Object.values(explorers).find(explorer => explorer.chainId === networkId)
        },
        ...mapActions('layers', ['init', 'initSingleContract']),
        // Bootstrap selection handling was broken due to rerenders caused byt fetching async data
        // This is why I had to handle selection on my own
        selectAllRows() {
            this.selectedItems = this.displayedTableItems.map(item => item.layer)
        },
        prefetchImages(images = networkImages) {
            const prefetchPromises = Object.values(images).map(url => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = url;
                });
            });

            return Promise.all(prefetchPromises)
                .then(() => console.log('All images prefetched successfully'))
                .catch(error => console.error('Error prefetching images:', error));
        },
        clearSelected() {
            this.selectedItems = []
        },
        toggleSelectAll(isSelected) {
            isSelected ? this.selectAllRows() : this.clearSelected()
        },
        getImageUrl(imageName) {
            return `/logos/${imageName}`
        },
        selectRow(index) {
            this.selectedItems.push(this.displayedTableItems[index]?.layer) // Defensive check
        },
        unselectRow(index) {
            this.selectedItems = this.selectedItems.filter(item => item !== this.displayedTableItems[index]?.layer) // Defensive check
        },
        handleChange(index, isSelected) {
            !isSelected ? this.selectRow(index) : this.unselectRow(index)
        },
        isSelected(index) {
            return this.selectedItems.includes(this.displayedTableItems[index]?.layer) // Defensive check
        },
        rowClass(item) {
            if (this.selectedItems.includes(item?.layer)) return 'table-active' // Defensive check
        },
        hasSlash(string) {
            return string.indexOf('/') >= 0
        },
        transformHexString(str) {
            if (str == null) return 'no data'
            if (str?.length <= 10) return str;
            return `${str?.slice(0, 7)} . . . ${str?.slice(-4)}`
        },
        getTokenImage(token) {
            return images.find(image => token.indexOf(image.token) >= 0)
        },
        unselectInvalidItems() {
            if (this.isUnselecting) return; // Prevent recursive calls
            this.isUnselecting = true;

            const newSelectedCryptos = this.selectedCryptos.filter(crypto =>
                this.filteredCurrencies.some(currency =>
                    currency.toLowerCase().includes(crypto.toLowerCase())
                )
            );

            const newSelectedNetworks = this.selectedNetworks.filter(network =>
                this.filteredNetworks.includes(network)
            );

            // Only update if there's a change
            if (!_.isEqual(newSelectedCryptos, this.selectedCryptos)) {
                this.selectedCryptos = newSelectedCryptos;
            }

            if (!_.isEqual(newSelectedNetworks, this.selectedNetworks)) {
                this.selectedNetworks = newSelectedNetworks;
            }

            this.isUnselecting = false;
        },
        ...mapActions('layout', ['updateSearchTerm'])
    },
    watch: {
        searchTerm(searchTerm) {
            if (searchTerm != '') {
                this.handleFilter('Search query', searchTerm)
            }
        },
        layers() {
            this.filteredItems = []
        },
    },
    computed: {
        cryptoImages() {
            return images.filter(image => this.filteredCurrencies?.some(currency => currency.indexOf(image.token) >= 0))
        },
        hasFilters() {
            return this.filters && (this.filters.selectedCryptos.length > 0 || this.filters.selectedNetworks.length > 0)
        },
        totalRows() {
            return this.filteredItems.length > 0 ? this.filteredItems.length : this.layers.length;
        },
        networksMap() {
            const map = Object.values(networks).map(network => ({ label: network.name, value: network.chainId }))
            return map.filter(item => this.filteredNetworks.includes(item.value))
        },
        chainOptions() {
            const options = this.layers.map(item => ({ text: item.chain, value: item.chain }))
            return [
                { value: null, text: 'Select chain' },
                ..._.uniqBy(options, 'value')
            ]
        },
        priceFeeds() {
            return [...new Set(this.layers.map(item => Object.keys(item.priceFeeds)).flat())]
        },
        paginatedLayers() {
            const startIndex = (this.currentPage - 1) * this.perPage;
            const endIndex = startIndex + this.perPage;
            return this.layers.slice(startIndex, endIndex);
        },
        allSelected() {
            return this.selectedItems.length === this.displayedTableItems.length
        },
        allLoadersResolved() {
            return this.displayedTableItems.every(({ loaders }) => !(loaders.blockTimestamp && loaders.feedDataValue && loaders.feedId))
        },
        selectedSchemas() {
            return this.selectedItems.map(layerId => this.layersSchema[layerId])
        },
        ...mapState({
            layersSchema: state => state.layers.layersSchema,
            searchTerm: state => state.layout.searchTerm,
        }),
        ...mapGetters('layers', [
            'combinedLayersWithDetailsArray'
        ]),
        filteredNetworks() {
            {
                if (this.selectedCryptos.length === 0) {
                    return Object.values(networks).map(item => item.chainId);
                }

                const networkSet = new Set();
                this.displayedTableItems?.forEach(layer => {
                    if (this.selectedCryptos.some(crypto => layer.feed.indexOf(crypto) >= 0)) {
                        networkSet.add(layer.network.id);
                    }
                });

                return Array.from(networkSet);
            }
        },
        filteredCurrencies() {
            {
                if (this.selectedNetworks.length === 0) {
                    return images.map(image => image.token)
                }

                const networkSet = new Set();
                this.displayedTableItems?.forEach(layer => {
                    if (this.selectedNetworks.some(chainId => layer.network.id === chainId)) {
                        networkSet.add(layer.token);
                    }
                });

                return Array.from(networkSet);
            }
        },
        layers() {
            return this.combinedLayersWithDetailsArray.map(item => {
                return {
                    feed: this.hasSlash(item.feedId) ? this.stripAdditionalFeedInfo(item.feedId) : this.stripAdditionalFeedInfo(item.feedId) + '/USD',
                    network: { id: item.networkId, name: this.findNetworkName(item.networkId), image: this.findNetworkImage(item.networkId) },
                    contract_address: item.contractAddress,
                    timestamp: { parsed: parseUnixTime(item.timestamp), raw: item.timestamp, date: hexToDate(item.timestamp) },
                    layer_id: item.layerId,
                    token: item.feedId,
                    token_image: this.getTokenImage(item.feedId),
                    loaders: item.loaders,
                    explorer: this.findExplorer(item.networkId)
                }
            })
        },
    }
}
</script>
<style lang="scss" src="./Layers.scss" />
