<template>
    <div class="sources-wrapper">
        <b-table id="sources-table" stacked="md" style="font-size:12x;" sort-icon-left hover :items="sources"
            :fields="fields">
            <template #cell(layer)="{ item }">
                <div class="layer">
                    <span class="ml-3">
                        {{ item.layer }}
                    </span>
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
                <b-button :href="`https://etherscan.io/address/${item.address}`"
                    class="btn btn-danger mr-2 rounded-pill" variant="primary"
                    style="font-size: 9px;padding: 7px 10px;">
                    https://etherscan.io/address/ {{ item.address }}
                </b-button>
                <input class="form-control" readonly :value="'Address: ' + item.address" role="button"
                    @click="copyToClipboard($event, item.address)" v-b-tooltip.hover title="Click to copy"
                    variant="primary" style="font-size: 9px;padding: 7px 10px;" />
                <input v-if="item.dataFeedId" class="form-control" readonly style="font-size: 9px;padding: 7px 10px;"
                    @click="copyToClipboard($event, item.dataFeedId)" :value="item.dataFeedId" v-b-tooltip.hover title="Click to copy" variant="primary">
            </template>
        </b-table>
    </div>
</template>

<script>
import _ from "lodash";
import { mapActions, mapGetters } from 'vuex'
import Loader from '../../../components/Loader/Loader.vue'
export default {
    components: {
        Loader
    },
    data() {
        return {
            fields: [
                { key: 'layer', label: 'Layer Id', sortable: true },
                { key: 'chain', label: 'Chain', sortable: true },
                { key: 'blockTimestamp', label: 'Block timestap', sortable: true },
                { key: 'feedDataValue', label: 'Feed data', sortable: true },
                { key: 'actions', label: 'Actions' },
            ],
        };
    },

    async mounted() {
        await this.init()
    },
    methods: {
        async copyToClipboard(event, evmAddress) {
            event.preventDefault();
            await navigator.clipboard.writeText(evmAddress);
        },
        ...mapActions('layers', ['init']),
        getColorForPercentage(value) {
            if (value == 100) {
                return '#0F9D58'; // green
            } else if (value >= 99) {
                return '#ff8c00'; // orange
            } else {
                return '#DB4437'; // red
            }
        },
    },

    computed: {
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