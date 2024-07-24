<template>
    <div class="layers">
        {{ paginatedLayersLayerIds }}
        <div class="layers__actions-wrapper">
            <NetworkPicker v-model="selectedNetworks" :items="networksMap" />
            <CryptoPicker @input="handleFilter('cryptos', $event)" v-model="selectedCryptos"></CryptoPicker>
            <div class="layers__actions-wrapper-item" v-if="currentFilter && filters">
                <div class="layers__actions-wrapper-label">Applied filters</div>
                <b-badge @click="resetFilters" pill class="layers__filter-badge" variant="danger">
                    {{ currentFilter }}: {{ filters }} <span class="layers__filter-badge-close">&times;</span>
                </b-badge>
            </div>
            <div class="layers__actions-wrapper-item layers__actions-wrapper-item--right">
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
                :current-page="currentPage" :filter-function="customFilter" @row-clicked="onRowClick"
                :tbody-tr-class="rowClass" :fields="fields" class="layers__table">
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
import copyToClipboardHelper from '../../../core/copyToClipboard'
import { parseUnixTime } from '../../../core/timeHelpers'
import LayerName from './components/LayerName'
import LayerChain from './components/LayerChain'
import LayerPriceFeeds from './components/LayerPriceFeeds'
import LayerTriggers from './components/LayerTriggers'
import CryptoPicker from "./components/CryptoPicker.vue"
import NetworkPicker from "./components/NetworkPicker.vue"
import networks from '@/data//networks.js'
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
        parseUnixTime,
        onRowClick(item) {
            this.$router.push({ name: 'LayerSinglePage', params: { layerId: item.layer } })
        },
        async handleFilter(filterType, value) {
            if (filterType != 'Search query' && this.searchTerm != null) {
                this.updateSearchTerm('')
            }
            this.filters = value
            if (filterType === 'cryptos') return
            this.currentFilter = filterType
        },
        onFiltered(filteredItems) {
            this.filteredItems = filteredItems
            this.currentPage = 1
            this.clearSelected()
        },
        customFilter(row, filterValue) {
            const rowDataString = JSON.stringify(row).toLowerCase()
            if (Array.isArray(filterValue)) {
                return filterValue.some(value =>
                    rowDataString.includes(String(value).toLowerCase())
                );
            } else {
                return rowDataString.includes(String(filterValue).toLowerCase())
            }
        },
        async resetFilters() {
            this.updateSearchTerm('')
            this.selectedChain = null
            this.filters = null
            this.currentFilter = null
        },
        copyToClipboard: copyToClipboardHelper,
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
        transformHexString(str) {
            if (str == null) return 'no data'
            if (str?.length <= 10) return str;
            return `${str?.slice(0, 7)} . . . ${str?.slice(-4)}`
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
        paginatedLayersLayerIds() {
            return this.paginatedLayers.forEach(item => {
                this.initSingleContract(item.layer_id)
            })
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
                    feed: item.feedId,
                    network: item.networkId,
                    contract_address: item.contractAddress,
                    timestamp: item.timestamp,
                    layer_id: item.layerId
                }
            })
        },
    }
}
</script>
<style lang="scss" src="./Layers.scss" />
