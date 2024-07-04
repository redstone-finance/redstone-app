<template>
    <div class="layers">
        <div class="layers__bulk-actions">
            <div class="layers__bulk-actions-item">
                <div class="layers__bulk-actions-label">Bulk actions:</div>
                <b-dropdown split :disabled="selectedItems.length < 1" id="dropdown-left" size="sm"
                    :text="`${selectedItems.length} item(s)`" variant="danger" class="layers__bulk-actions-dropdown"
                    split-variant="outline-danger">
                    <!-- Dropdown content remains the same -->
                </b-dropdown>
            </div>
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
        <b-table id="sources-table" class="layers__table" v-model="displayedTableItems" key="table" stacked="md" ref="selectableTable"
            @filtered="onFiltered" style="font-size:12x;" :filter="filters" sort-icon-left hover :items="sources"
            select-mode="multi" :tbody-tr-class="rowClass" :fields="fields">
            <template #head(selected)>
                <b-form-checkbox class="toggle-all-checkbox" size="lg" :checked="allSelected"
                    @change="toggleSelectAll" />
            </template>

            <template #cell(selected)="{ item, index }">
                <b-form-checkbox size="lg" :id="item.layer" :checked="isSelected(index)"
                    @change="handleChange(index, isSelected(index))" />
            </template>
            <template #cell(layer)="{ item }">
                <div class="layer-details d-flex">
                    <div>
                        <div class="layer-details__title featured">
                            <label>Layer name</label>
                            <strong>{{ item.layer }}</strong>
                        </div>
                        <div class="layer-details__title mt-2">
                            <label>Chain</label>
                            <strong>{{ item.chain }}</strong>
                            <span>ID:{{ item.chainId }}</span>
                        </div>
                    </div>

                    <div class="layer-details__title ml-4 triggers">
                        <label>Update triggers</label>
                        <pre
                            @click="copyToClipboard($event, JSON.stringify(item.updateTriggers))"><code v-text="item.updateTriggers"></code></pre>
                    </div>

                </div>
            </template>
            <template #cell(chain)="{ item }">
                <div class="layer">
                    <span class="ml-3">
                        {{ item.chain }}
                    </span>
                </div>
            </template>
            <template #cell(address)="{ item }">
                <div class="layer">
                    <input class="form-control" readonly :value="item.address" role="button" />
                </div>
            </template>
            <template #cell(blockTimestamp)="{ item }">
                <div class="layer ">
                    <Loader style="width: 50px" v-if="item.loaders.blockTimestamp"></Loader>
                    <span v-else-if="item.blockTimestamp">
                        {{ item.blockTimestamp }}
                    </span>
                    <span v-else v-b-tooltip.hover style="font-size: 10px;"
                        title="SmartContract does not provide timestamp" class="text-secondary">no data
                        &times;</span>
                </div>
            </template>
            <template #cell(feedDataValue)="{ item }">
                <div class="layer">
                    <Loader style="width: 50px" v-if="item.loaders.feedDataValue"></Loader>
                    <span v-else-if="item.feedDataValue" class="ml-3">
                        {{ item.feedDataValue }}
                    </span>
                    <div v-else class="text-secondary" style="font-size: 10px;" v-b-tooltip.hover
                        title="SmartContract does not provide feed data value">No data &times;</div>
                </div>
            </template>
            <template #cell(dataFeedId)="{ item }">
                <div class="layer text-center">
                    <Loader v-if="item.loaders.feedId"></Loader>
                    <input v-else-if="item.dataFeedId" class="form-control" v-b-tooltip.hover title="Click to copy"
                        readonly @click="copyToClipboard($event, item.dataFeedId)" :value="item.dataFeedId"
                        role="button" />
                    <div v-else class="text-secondary" v-b-tooltip.hover title="SmartContract does not provide feed id">
                        &times;</div>
                </div>
            </template>
            <template #cell(actions)="{ item }">
                <!-- <b-button :href="`https://etherscan.io/address/${item.address}`"
                    class="btn btn-danger mr-2 rounded-pill" variant="primary"
                    style="font-size: 9px;padding: 7px 10px;">
                    https://etherscan.io/address/ {{ item.address }}
                </b-button> -->
                <input class="form-control" readonly :value="'Address: ' + item.address" role="button"
                    @click="copyToClipboard($event, item.address)" v-b-tooltip.hover title="Click to copy"
                    variant="primary" style="font-size: 9px;padding: 7px 10px;" />
                <input v-if="item.dataFeedId" class="form-control" readonly style="font-size: 9px;padding: 7px 10px;"
                    @click="copyToClipboard($event, item.dataFeedId)" :value="item.dataFeedId" v-b-tooltip.hover
                    title="Click to copy" variant="primary">
            </template>
        </b-table>
    </div>
</template>

<script>
import _ from "lodash";
import { mapActions, mapGetters, mapState } from 'vuex'
import Loader from '../../../components/Loader/Loader.vue'
import copyToClipboardHelper from '../../../core/copyToClipboard'
export default {
    components: {
        Loader
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
