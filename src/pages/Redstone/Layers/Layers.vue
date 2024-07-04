<template>
    <div class="layers-wrapper">
      <div class="bulk-actions-wrapper">
        <div style="font-size:10px; font-weight: bold;" class="mb-2">Bulk actions:</div>
        <b-dropdown split :disabled="selectedItems.length < 1" id="dropdown-left" size="sm"
            :text="`${selectedItems.length} item(s)`" variant="danger" class="bulk-actions-button"
            split-variant="outline-danger">
            <b-dropdown-item href="#as">
                <div class="mb-2">
                    Open in
                </div>
                <b-button class="mr-2" size="sm" href="#foo" variant="outline-danger">Etherscan</b-button>
                <b-button size="sm" class="mr-2" href="#foo" variant="outline-danger">Blockscout</b-button>
                <b-button size="sm" href="#foo" variant="outline-danger">Zapper</b-button>
            </b-dropdown-item>
            <b-dropdown-item>
                <div class="copy-section mb-2">Copy</div>
                <div class="mb-2">
                    <b-button size="sm" href="#foo" variant="outline-danger">trigger conditions</b-button>
                    <b-button size="sm" href="#foo" class="ml-2" variant="outline-danger">price feeds</b-button>
                </div>
                <div>
                    <b-button size="sm" href="#foo" variant="outline-danger">contract address</b-button>
                    <b-button size="sm" href="#foo" class="ml-2" variant="outline-danger">chain details</b-button>
                </div>
            </b-dropdown-item>
            <b-dropdown-item href="#as">

                <b-button block href="#foo" variant="danger">
                    <strong>
                        Full definition
                    </strong>
                </b-button>

            </b-dropdown-item>
        </b-dropdown>
      </div>
        <b-table id="sources-table" v-model="displayedTableItems" key="table" stacked="md" ref="selectableTable"
            style="font-size:12x;" :filter="searchTerm" @filtered="clearSelected" sort-icon-left hover :items="sources"
            select-mode="multi" :tbody-tr-class="rowClass" :fields="fields">
            <template #head(selected)>
                <b-form-checkbox size="lg" :checked="allSelected" @change="toggleSelectAll" />
            </template>

            <template #cell(selected)="{ item, index }">
                <b-form-checkbox size="lg" :id="item.layer" :checked="isSelected(index)"
                    @change="handleChange(index, isSelected(index))" />
            </template>
            <template #cell(layer)="{ item }">
                <div class="layer-details">
                    <div class="layer-details__title">
                        <label>Layer name</label>
                        <strong>{{ item.layer }}</strong>
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
                        title="SmartContract does not provide timestamp" class="text-secondary">no data &times;</span>
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
            fields: [
                { key: 'selected', label: '#', thStyle: { width: '50px' } },
                { key: 'layer', label: 'Details', thStyle: { width: '70%' } },
                // { key: 'chain', label: 'Chain', sortable: true },
                { key: 'blockTimestamp', label: 'Block timestap', sortable: true, },
                { key: 'feedDataValue', label: 'Feed data', sortable: true },
                // { key: 'actions', label: 'Address' },
            ],
        };
    },

    async mounted() {
        await this.init()
    },
    methods: {
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
        }
    },

    computed: {
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