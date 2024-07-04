<template>
    <div class="layers">
        <div class="layers__bulk-actions">
            <BulkActions :selectedItemsCount="selectedItems.length" />
            <div class="layers__bulk-actions-item">
                <div class="layers__bulk-actions-label">Filter by chain:</div>
                <b-form-select v-model="selectedChain" size="sm" @change="handleFilter('chain', $event)"
                    :options="chainOptions" class="layers__chain-select"></b-form-select>
            </div>
            <div class="layers__bulk-actions-item" v-if="currentFilter && filters">
                <div class="layers__bulk-actions-label">Applied filters</div>
                <b-badge @click="resetFilters" pill class="layers__filter-badge" variant="danger">
                    {{ currentFilter }}: {{ filters }} <span class="layers__filter-badge-close">&times;</span>
                </b-badge>
            </div>
            <div class="layers__bulk-actions-item layers__bulk-actions-item--right">
                <div class="layers__bulk-actions-label">Status</div>
                <span class="layers__status-text"><strong>{{ displayedTableItems.length }}</strong> layers
                    displayed</span>
            </div>
        </div>
        <template>
            <b-table id="sources-table" v-model="displayedTableItems" key="table" stacked="md" ref="selectableTable"
                @filtered="onFiltered" :filter="filters" sort-icon-left hover :items="sources"
                 @row-clicked="onRowClick" :tbody-tr-class="rowClass" :fields="fields" class="layers__table">
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
                            <div class="layers__details-title layers__details-title--featured">
                                <label class="layers__label">Layer name</label>
                                <strong class="layers__value">{{ item.layer }}</strong>
                            </div>
                            <div class="layers__details-title">
                                <label class="layers__label">Chain</label>
                                <strong class="layers__value">{{ item.chain }}</strong>
                                <span class="layers__chain-id">ID:{{ item.chainId }}</span>
                            </div>
                        </div>

                        <div class="layers__details-title layers__details-title--triggers">
                            <label class="layers__label">Update triggers</label>
                            <pre class="layers__triggers" v-b-tooltip.hover title="Click to copy"
                                @click="copyToClipboard($event, JSON.stringify(item.updateTriggers))"><code v-text="item.updateTriggers"></code></pre>
                        </div>
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
                        <span v-else-if="item.blockTimestamp" class="layers__timestamp-value">
                            {{ item.blockTimestamp }}
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
import Loader from '../../../components/Loader/Loader.vue'
import copyToClipboardHelper from '../../../core/copyToClipboard'
import BulkActions from './BulkActions.vue'
export default {
    components: {
        Loader,
        BulkActions
    },
    data() {
        return {
            selectAll: false,
            displayedTableItems: [],
            selectedItems: [],
            filters: '',
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
        onRowClick(item) {
            console.log('ROW CLICK')
            this.$router.push({ name: 'LayerSinglePage', params: { layerId: item.layer } })
        },
        handleFilter(filterType, value) {
            this.resetFilters(filterType)
            this.filters = value,
                this.currentFilter = filterType
        },
        onFiltered() {
            this.clearSelected()
        },
        resetFilters(filterType) {
            if (filterType != 'Search query') {
                this.updateSearchTerm('')
            }
            this.filters = null,
                this.currentFilter = null
        },
        copyToClipboard: copyToClipboardHelper,
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
            this.selectedItems.push(this.displayedTableItems[index].layer)
        },
        unselectRow(index) {
            this.selectedItems = this.selectedItems.filter(item => item !== this.displayedTableItems[index].layer)
        },
        handleChange(index, isSelected) {
            !isSelected ? this.selectRow(index) : this.unselectRow(index)
        },
        isSelected(index) {
            return this.selectedItems.includes(this.displayedTableItems[index].layer)
        },
        rowClass(item) {
            if (this.selectedItems.includes(item.layer)) return 'table-active'
        },
        ...mapActions('layout', ['updateSearchTerm'])
    },
    watch: {
        // whenever question changes, this function will run
        searchTerm(searchTerm) {
            this.handleFilter('Search query', searchTerm)
        }
    },
    computed: {
        chainOptions() {
            const options = this.sources.map(item => ({ text: item.chain, value: item.chain }))
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
        ...mapState({
            searchTerm: state => state.layout.searchTerm,
        }),
        ...mapGetters('layers', [
            'combinedLayersWithDetailsArray'
        ]),
        sources() {
            return this.combinedLayersWithDetailsArray.map(item => (
                {
                    layer: item.key,
                    chain: item.values.chain.name,
                    chainId: item.values.chain.id,
                    updateTriggers: item.values.updateTriggers,
                    address: item.values.adapterContract,
                    timestamp: item.values.details.blockTimestamp,
                    feedDataValue: item.values.details.feedData,
                    dataFeedId: item.values.details.feedId,
                    loaders: item.values.details.loaders,
                }
            ))
        },
    }
}
</script>
<style lang="scss" src="./Layers.scss" />
