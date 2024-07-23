<template>
    <div class="layers">
        <div class="layers__actions-wrapper">
            <BulkActions :selectedItemsCount="selectedItems.length"
                @copy-trigger-conditions="copy('conditions', $event)" @copy-price-feeds="copy('priecFeeds', $event)"
                @copy-contract-address="copy('contractAddress', $event)"
                @copy-chain-details="copy('chainDetails', $event)"
                @copy-full-definition="copy('fullDefinition', $event)" />
            <div class="layers__actions-wrapper-item">
                <div class="layers__actions-wrapper-label">Filter by chain:</div>
                <b-form-select v-model="selectedChain" size="sm" @input="handleFilter('chain', $event)"
                    :options="chainOptions" class="layers__chain-select"></b-form-select>
            </div>
            <div class="layers__actions-wrapper-item" v-if="currentFilter && filters">
                <div class="layers__actions-wrapper-label">Applied filters</div>
                <b-badge @click="resetFilters" pill class="layers__filter-badge" variant="danger">
                    {{ currentFilter }}: {{ filters }} <span class="layers__filter-badge-close">&times;</span>
                </b-badge>
            </div>
            <div class="layers__actions-wrapper-item layers__actions-wrapper-item--right">
                <div class="layers__actions-wrapper-label">Status</div>
                <span class="layers__status-text"><strong>{{ chainOptions.length }}</strong> chains
                    available</span>
                <span class="layers__status-text"><strong>{{ displayedTableItems.length }}</strong> layers
                    displayed</span>
            </div>
        </div>
        <template>
            <b-table id="layers-table" v-model="displayedTableItems" key="table" stacked="md" ref="selectableTable"
                @filtered="onFiltered" :filter="filters" sort-icon-left hover :items="layers" @row-clicked="onRowClick"
                :tbody-tr-class="rowClass" :fields="fields" class="layers__table">
                <template #head(selected)>
                    <b-form-checkbox class="layers__toggle-all" size="lg" :checked="allSelected"
                        @change="toggleSelectAll" />
                </template>

                <template #cell(selected)="{ item, index }">
                    <b-form-checkbox class="layers__checkbox" size="lg" :id="item.layer" :checked="isSelected(index)"
                        @change="handleChange(index, isSelected(index))" />
                </template>
                <template #cell(layer)="{ item }">
                    <div class="layers__details">
                        <div class="layers__details-column">
                            <LayerName :layerName="item.layer">
                                <div v-b-tooltip.hover title="Click to copy"
                                    @click.stop="copyToClipboard($event, item.address)">
                                    <strong style="color: #000;">{{ item.address }}</strong>
                                </div>
                            </LayerName>
                            <LayerChain :chain="item.chain" :chainId="item.chainId" />
                            <LayerPriceFeeds :priceFeeds="item.priceFeeds" />
                        </div>
                        <LayerTriggers :updateTriggers="item.updateTriggers" />
                    </div>
                </template>
                <template #cell(chain)="{ item }">
                    <div class="layers__chain">
                        <span class="layers__chain-value">
                            {{ item.chain }}
                        </span>
                    </div>
                </template>
                <template #cell(address)="{ item }">
                    <div class="layers__address">
                        <input class="layers__address-input" readonly :value="item.address" role="button" />
                    </div>
                </template>
                <template #cell(blockTimestamp)="{ item }">
                    <div class="layers__timestamp">
                        <Loader class="layers__loader" v-if="item.loaders.blockTimestamp"></Loader>
                        <span v-else-if="item.blockTimestamp > 0" class="layers__timestamp-value">
                            {{ parseUnixTime(item.blockTimestamp) }} ago
                        </span>
                        <span v-else v-b-tooltip.hover title="SmartContract does not provide timestamp"
                            class="layers__no-data">no data
                            &times;</span>
                    </div>
                </template>
                <template #cell(feedDataValue)="{ item }">
                    <div class="layers__feed-data">
                        <Loader class="layers__loader" v-if="item.loaders.feedDataValue"></Loader>
                        <span v-else-if="item.feedDataValue" class="layers__feed-data-value">
                            {{ item.feedDataValue }}
                        </span>
                        <div v-else class="layers__no-data" v-b-tooltip.hover
                            title="SmartContract does not provide feed data value">No data &times;</div>
                    </div>
                </template>
            </b-table>
        </template>
    </div>
</template>

<script>
import _ from "lodash";
import { mapActions, mapGetters, mapState } from 'vuex'
import Loader from '../../../components/Loader/Loader'
import copyToClipboardHelper from '../../../core/copyToClipboard'
import { parseUnixTime } from '../../../core/timeHelpers'
import BulkActions from './components/BulkActions'
import LayerName from './components/LayerName'
import LayerChain from './components/LayerChain'
import LayerPriceFeeds from './components/LayerPriceFeeds'
import LayerTriggers from './components/LayerTriggers'
export default {
    components: {
        Loader,
        BulkActions,
        LayerName,
        LayerChain,
        LayerPriceFeeds,
        LayerTriggers
    },
    data() {
        return {
            selectAll: false,
            displayedTableItems: [],
            selectedItems: [],
            filters: null,
            currentFilter: null,
            selectedChain: null,
            fields: [
                { key: 'selected', label: '#', thStyle: { width: '50px' } },
                { key: 'layer', label: 'Details', thStyle: { width: '70%' } },
                { key: 'blockTimestamp', label: 'Block timestap', sortable: true, },
                { key: 'feedDataValue', label: 'Feed data', sortable: true },
            ],
        };
    },

    async mounted() {
        await this.init()
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
            this.currentFilter = filterType
        },
        onFiltered() {
            this.clearSelected()
        },
        async resetFilters() {
            this.updateSearchTerm('')
            this.selectedChain = null
            this.filters = null
            this.currentFilter = null
        },
        copyToClipboard: copyToClipboardHelper,

        copy(type, event) {
            const methodsMap = {
                'conditions': () => this.selectedSchemas.map(schema => schema.updateTriggers),
                'priecFeeds': () => this.selectedSchemas.map(schema => schema.priceFeeds),
                'contractAddress': () => this.selectedSchemas.map(schema => schema.adapterContract),
                'chainDetails': () => this.selectedSchemas.map(schema => schema.chain),
                'fullDefinition': () => this.selectedSchemas
            }
            this.copyToClipboard(event, JSON.stringify(methodsMap[type]()))
        },
        ...mapActions('layers', ['init']),
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
            if(str == null) return 'no data'
            if (str?.length <= 10) return str;
            return `${str?.slice(0, 8)}...${str?.slice(-3)}`;
        },

        ...mapActions('layout', ['updateSearchTerm'])
    },
    watch: {
        searchTerm(searchTerm) {
            if (searchTerm != '') {
                this.handleFilter('Search query', searchTerm)
            }
        }
    },
    computed: {
        chainOptions() {
            const options = this.layers.map(item => ({ text: item.chain, value: item.chain }))
            return [
                { value: null, text: 'Select chain' },
                ..._.uniqBy(options, 'value')
            ];
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
            return this.combinedLayersWithDetailsArray.map(item => (
                {
                    layer: item.key,
                    chain: item.values.chain.name,
                    chainId: item.values.chain.id,
                    updateTriggers: item.values.updateTriggers,
                    address: item.values.adapterContract,
                    blockTimestamp: item.values.details.blockTimestamp,
                    priceFeeds: item.values.priceFeeds,
                    feedDataValue: this.transformHexString([...new Set(item.values.details.dataFeed?.flat(Infinity))][0]), // flat array without duplicates
                    dataFeedId: item.values.details.feedId,
                    loaders: item.values.details.loaders,
                }
            ))
        },
    }
}
</script>
<style lang="scss" src="./Layers.scss" />
