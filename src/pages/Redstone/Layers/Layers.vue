<template>
    <div class="layers">
        <div class="layers__actions-wrapper">
            <NetworkPicker @input="handleFilter('networks', $event)" v-model="selectedNetworks" :items="networksMap" />
            <CryptoPicker @input="handleFilter('cryptos', $event)" v-model="selectedCryptos"></CryptoPicker>
            <div class="layers__actions-wrapper-item" v-if="currentFilter && filters">
                <div class="layers__actions-wrapper-label">Applied filters</div>
                <b-badge @click="resetFilters" pill class="layers__filter-badge" variant="danger">
                    {{ currentFilter }}: {{ filters }} <span class="layers__filter-badge-close">&times;</span>
                </b-badge>
            </div>
            <div class="layers__actions-wrapper-item layers__actions-wrapper-item--right">
                <div v-if="filters" @click="resetFilters">Rest filters</div>
                <div class="layers__actions-wrapper-label">Status</div>
                <span class="layers__status-text"><strong>{{ networksMap.length }}</strong> networks
                    available</span>
                <span class="layers__status-text"><strong>{{ displayedTableItems.length }}</strong> layers
                    displayed</span>
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
                    <span v-b-tooltip.hover @click.prevent="copyToClipboardHelper($event, item.contract_address)"
                        title="Copy contract address" style="color: var(--redstone-red-color)"> {{
                            truncateString(item.contract_address) }}</span>
                </template>
                <template #cell(feed)="{ item }">
                    <img :src="getImageUrl(item.token_image?.imageName)" class="token-image"> {{ item.feed }}
                </template>
                <template #cell(timestamp)="{ item }">
                    <Loader v-if="item.loaders.blockTimestamp" />
                    <span v-else-if="item.timestamp.raw">{{ item.timestamp.parsed }}</span>
                    <span v-else>no-data</span>
                </template>
            </b-table>
            <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="center"
                class="my-3"></b-pagination>
        </template>
    </div>
</template>

<script>
import _ from "lodash";
import { mapActions, mapGetters, mapState } from 'vuex'
import Loader from '../../../components/Loader/Loader'
import { parseUnixTime } from '../../../core/timeHelpers'
import copyToClipboardHelper from '../../../core/copyToClipboard'
import truncateString from "../../../core/truncate";
import LayerName from './components/LayerName'
import LayerChain from './components/LayerChain'
import LayerPriceFeeds from './components/LayerPriceFeeds'
import LayerTriggers from './components/LayerTriggers'
import CryptoPicker from "./components/CryptoPicker.vue"
import NetworkPicker from "./components/NetworkPicker.vue"
import networkImages from "../../../data/networkImages";
import networks from '@/data//networks.js'
import images from '@/core/logosDefinitions.js'
export default {
    components: {
        Loader,
        LayerName,
        LayerChain,
        LayerPriceFeeds,
        LayerTriggers,
        CryptoPicker,
        NetworkPicker
    },
    data() {
        return {
            selectAll: false,
            displayedTableItems: [],
            selectedItems: [],
            filters: null,
            currentFilter: null,
            selectedChain: null,
            selectedCryptos: [],
            selectedNetworks: [],
            perPage: 15,
            currentPage: 1,
            filteredItems: [],
            fields: [
                { key: 'feed', label: 'Feed', sortable: true },
                { key: 'network', label: 'Network', sortable: true },
                { key: 'contract_address', label: 'Contract address' },
                { key: 'timestamp', label: 'Block timestamp', sortable: true },
            ],
        };
    },

    async mounted() {
        await this.init()
        console.log({ ee: this.combinedLayersWithDetailsArray })
    },
    methods: {
        copyToClipboardHelper,
        truncateString,
        parseUnixTime,
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
        handleFilter(filterType, value) {
            if (filterType === 'cryptos') {
                this.selectedCryptos = value;
            } else if (filterType === 'networks') {
                this.selectedNetworks = value;
            }
            this.applyFilters()
        },

        applyFilters() {
            this.filters = {
                selectedCryptos: this.selectedCryptos,
                selectedNetworks: this.selectedNetworks
            };

            this.$refs.selectableTable.refresh();
        },
        resetFilters() {
            this.selectedCryptos = [];
            this.selectedNetworks = [];
            this.filters = null;
            this.currentFilter = null;
            this.$refs.selectableTable.refresh();
        },
        onFiltered(filteredItems) {
            this.filteredItems = filteredItems
            this.currentPage = 1
            this.clearSelected()
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
        ...mapActions('layers', ['init', 'initSingleContract']),
        // Bootstrap selection handling was broken due to rerenders caused byt fetching async data
        // This is why I had to handle selection on my own
        selectAllRows() {
            this.selectedItems = this.displayedTableItems.map(item => item.layer)
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
            this.currentPage = 1
        },
    },
    computed: {
        totalRows() {
            return this.filteredItems.length > 0 ? this.filteredItems.length : this.layers.length;
        },
        networksMap() {
            return Object.values(networks).map(network => ({ label: network.name, value: network.chainId }))
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
        layers() {
            return this.combinedLayersWithDetailsArray.map(item => {
                return {
                    feed: this.hasSlash(item.feedId) ? this.stripAdditionalFeedInfo(item.feedId) : this.stripAdditionalFeedInfo(item.feedId) + '/USD',
                    network: { id: item.networkId, name: this.findNetworkName(item.networkId), image: this.findNetworkImage(item.networkId) },
                    contract_address: item.contractAddress,
                    timestamp: { parsed: parseUnixTime(item.timestamp), raw: item.timestamp },
                    layer_id: item.layerId,
                    token_image: this.getTokenImage(item.feedId),
                    loaders: item.loaders
                }
            })
        },
    }
}
</script>
<style lang="scss" src="./Layers.scss" />
