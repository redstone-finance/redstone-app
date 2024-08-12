<template>
    <div class="feeds">
        <div class="feeds__actions-wrapper">
            <div>
                <div class="feeds__actions-wrapper-item">
                    <NetworkPicker @input="handleFilter('networks', $event)"
                        v-model="selectedNetworks" :items="networksMap" class="feeds__network-picker" />
                    <CryptoPicker :items="cryptoImages"
                        @input="handleFilter('cryptos', $event)" v-model="selectedCryptos"
                        class="feeds__crypto-picker" />
                </div>
                <div class="feeds__actions-wrapper-item">
                    <div v-if="selectedNetworks.length > 0">
                        <div class="selected-items">Selected networks:</div>
                        <SelectedFilters @remove="removeNetwork" class="mt-2" :filters="displayedSelectedNetworks" />
                    </div>
                    <div class="separator" v-if="selectedCryptos.length > 0 && selectedNetworks.length > 0"></div>
                    <div v-if="selectedCryptos.length > 0" class="second-filters">
                        <div class="selected-items">Selected cryptos:</div>
                        <SelectedFilters @remove="removeCrypto" class="mt-2" :filters="displayedSelectedCryptos" />
                    </div>
                </div>
            </div>
            <div class="feeds__actions-wrapper-item feeds__actions-wrapper-item--right">
                <div class="feeds__status">
                    <div v-if="hasFilters" class="clear-filters" @click="resetFilters">Clear all</div>
                    <div class="feeds__actions-wrapper-label">Displaying</div>
                    <span class="feeds__status-text">
                        <strong>{{ selectedNetworks.length || networksMap.length }}</strong> networks
                    </span>
                    <span class="feeds__status-text">
                        <strong>{{ filteredItems.length }}</strong> feeds
                    </span>
                </div>
            </div>
        </div>
        <b-table v-if="displayedTableItems" id="feeds-table" v-model="displayedTableItems" key="table" stacked="md"
            ref="selectableTable" :sortBy="sortBy" :sortDesc="sortDesc" @filtered="onFiltered" :filter="filters"
            sort-icon-left hover :items="feeds" :per-page="perPage" @sort-changed="handleSort"
            :current-page="currentPage" :filter-function="customFilter" :fields="fields" class="feeds__table">
            <template #cell(network)="{ item }">
                <img class="feeds__token-image" :src="item.network.image" :alt="item.network.name">
                {{ item.network.name }}
            </template>
            <template #cell(contract_address)="{ item }">
                <contract-address :item="item" />
            </template>
            <template #cell(feed)="{ item }">
                <img :src="getImageUrl(item.token_image?.imageName)" class="feeds__token-image" :alt="item.feed">
                <router-link class="feeds__feed-link"
                    :to="{ name: 'SingleFeed', params: { network: createNetworkUrlParam(item.network.name), token: item.token.toLowerCase(), meta: item } }">
                    <span>{{ item.feed }}</span>
                </router-link>
            </template>
            <template #cell(timestamp)="{ item }">
                <TimestampWithLoader :isLoading="item.loaders.blockTimestamp" :rawTimestamp="item.timestamp.raw"
                    :formattedDate="item.timestamp.date" :parsedTimestamp="item.timestamp.parsed" />
            </template>
            <template #cell(heartbeat)="{ item }">
                <HeartbeatTimer :isLoading="item.loaders.blockTimestamp" :heartbeat="item.heartbeat"
                    :layerId="item.layer_id" />
            </template>
        </b-table>
        <b-pagination prev-text="Previous page" next-text="Next page" limit="1" @change="onPageChange"
            v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="fill"
            class="my-3 custom-pagination"></b-pagination>
    </div>
</template>

<script>
import _ from "lodash";
import { mapActions, mapGetters } from 'vuex'
// Helpers
import copyToClipboardHelper from '@/core/copyToClipboard'
import prefetchImages from "@/core/prefetchImages"
import truncateString from "@/core/truncate"
// Components
import Loader from '../../../components/Loader/Loader'
import CryptoPicker from "./components/CryptoPicker.vue"
import NetworkPicker from "./components/NetworkPicker.vue"
import CheckboxButton from "./components/CheckboxButton.vue"
import ToDateCounter from "./components/ToDateCounter.vue"
import ContractAddress from "./components/ContractAddress.vue";
import TimestampWithLoader from "./components/TimestampWithLoader.vue";
import HeartbeatTimer from "./components/HeartbeatTimer.vue";
import SelectedFilters from "./components/SelectedFilters.vue"
// Definitions
import networks from '@/data/networks.json'
import images from '@/data/logosDefinitions.json'
// Utils
import { transformFeed } from './feedUtils'


export default {
    components: {
        Loader,
        CryptoPicker,
        NetworkPicker,
        CheckboxButton,
        ToDateCounter,
        ContractAddress,
        TimestampWithLoader,
        HeartbeatTimer,
        SelectedFilters
    },
    data() {
        return {
            displayedTableItems: [],
            filters: null,
            selectedChain: null,
            selectedCryptos: [],
            selectedNetworks: [],
            perPage: 8,
            sortBy: null,
            sortDesc: false,
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
                { key: 'contract_address', label: 'Addresses' },
                { key: 'heartbeat', label: 'Heartbeat' },
                { key: 'deviation', label: 'Deviation threshold ' },
                {
                    key: 'timestamp', label: 'Last update', sortable: true,
                    sortByFormatted: true,
                    formatter: (value, key, item) => item.timestamp.raw
                },
            ],
        };
    },

    async mounted() {
        prefetchImages(Object.values(networks).map(network => network.iconUrl))
        await this.init()
        this.initializeFiltersFromRoute()
        this.$nextTick(() => {
            this.isInitialLoad = false
        })
    },
    methods: {
        copyToClipboardHelper,
        truncateString,
        initializeFiltersFromRoute() {
            const { cryptos, networks, page, sortBy, sortDesc } = this.$route.query
            this.selectedCryptos = cryptos ? cryptos.split(',') : []
            this.selectedNetworks = networks ? networks.split(',').map(Number) : []
            this.currentPage = page ? parseInt(page) : 1
            this.sortBy = sortBy || null
            this.sortDesc = sortDesc === 'true'
            this.applyFilters()
        },
        updateRouteParams() {
            if (this.isInitialLoad) return
            const query = { ...this.$route.query }
            if (this.selectedCryptos.length > 0) {
                query.cryptos = this.selectedCryptos.join(',')
            } else {
                delete query.cryptos
            }
            if (this.selectedNetworks.length > 0) {
                query.networks = this.selectedNetworks.join(',')
            } else {
                delete query.networks
            }
            query.page = this.currentPage.toString()

            // Add sorting parameters
            if (this.sortBy) {
                query.sortBy = this.sortBy
                query.sortDesc = this.sortDesc.toString()
            } else {
                delete query.sortBy
                delete query.sortDesc
            }

            this.$router.push({ query }).catch(err => {
                if (err.name !== 'NavigationDuplicated') {
                    throw err
                }
            });
        },
        handleFilter(filterType, value) {
            if (filterType === 'cryptos') {
                this.selectedCryptos = value
            } else if (filterType === 'networks') {
                this.selectedNetworks = value
            }
            if (!this.isInitialLoad) {
                this.currentPage = 1 // Reset to first page when filters change, but not on initial load
            }
            this.applyFilters()
            this.updateRouteParams()
        },
        handleSort(ctx) {
            this.sortBy = ctx.sortBy
            this.sortDesc = ctx.sortDesc
            this.updateRouteParams()
        },
        applyFilters() {
            this.filters = {
                selectedCryptos: this.selectedCryptos,
                selectedNetworks: this.selectedNetworks
            };
            this.$refs.selectableTable.refresh()
        },
        resetFilters() {
            this.selectedCryptos = []
            this.selectedNetworks = []
            this.filters = null
            this.currentFilter = null
            this.currentPage = 1
            this.sortBy = null
            this.sortDesc = false
            this.$refs.selectableTable.refresh()
            this.updateRouteParams()
        },
        onPageChange(page) {
            this.currentPage = page
            this.updateRouteParams()
        },
        onFiltered(filteredItems) {
            this.filteredItems = filteredItems
            this.unselectInvalidItems()
        },
        customFilter(row, filters) {
            if (!filters) return true

            const { selectedCryptos, selectedNetworks } = filters

            const cryptoMatch = selectedCryptos.length === 0 || selectedCryptos.some(crypto => {
                const feedParts = row.feed.split('/')
                return feedParts[0].toLowerCase() === crypto.toLowerCase();
            });
            const networkMatch = selectedNetworks.length === 0 || selectedNetworks.includes(row.network.id)

            return cryptoMatch && networkMatch
        },
        unselectInvalidItems() {
            if (this.isUnselecting) return; // Prevent recursive calls
            this.isUnselecting = true

            const newSelectedCryptos = this.selectedCryptos.filter(crypto =>
                this.filteredCurrencies.some(currency =>
                    currency.toLowerCase().includes(crypto.toLowerCase())
                )
            );
            const newSelectedNetworks = this.selectedNetworks.filter(network =>
                this.filteredNetworks.includes(network)
            );
            if (!_.isEqual(newSelectedCryptos, this.selectedCryptos)) {
                this.selectedCryptos = newSelectedCryptos
            }
            if (!_.isEqual(newSelectedNetworks, this.selectedNetworks)) {
                this.selectedNetworks = newSelectedNetworks
            }
            this.isUnselecting = false;
        },
        handleSingleFilterCheckbox(data) {
            if (!data.isChecked) {
                this.selectedCryptos.push(data.value)
            } else {
                this.selectedCryptos = this.selectedCryptos.filter(token => token != data.value)
            }
            this.handleFilter('crypto', this.selectedCryptos)
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
        findNetworkName(networkId) {
            return Object.values(networks).find(network => network.chainId === networkId).name
        },
        findNetworkImage(networkId) {
            return Object.values(networks).find(network => network.chainId === networkId).iconUrl
        },
        findNetwork(networkId) {
            return Object.values(networks).find(network => network.chainId === networkId)
        },
        findExplorer(networkId) {
            const hasExplorer = Object.values(networks).some(network => network.chainId === networkId)
            if (!hasExplorer) console.warn('Missing explorer for chain:', networkId)
            return Object.values(networks).find(network => network.chainId === networkId).explorerUrl
        },
        nearestCron(cronString) {
            const nearestDate = findNearestCronDate(JSON.parse(cronString))
            const timeUntil = timeUntilDate(nearestDate)
            return timeUntil
        },
        getFirstPart(string) {
            const noSlash = string.split('/')[0]
            const noUnder = noSlash.split('_')[0]
            const noDash = noUnder.split('-')[0]
            return noDash
        },
        getImageUrl(imageName) {
            return `https://raw.githubusercontent.com/redstone-finance/redstone-images/main/symbols/${imageName}`
        },
        createNetworkUrlParam(networkName) {
            return networkName.toLowerCase().replace(' ', '-')
        },
        removeCrypto(item) {
            this.selectedCryptos = this.selectedCryptos.filter(crypto => crypto != item)
            this.handleFilter('cryptos', this.selectedCryptos)
            this.updateRouteParams()
        },
        removeNetwork(item) {
            this.selectedNetworks = this.selectedNetworks.filter(network => network != item)
            this.handleFilter('networks', this.selectedNetworks)
            this.updateRouteParams()
        },
        tokenInNetwork(token, networkId) {
            return this.tokensInNetworks.some(item => item.token === token && item.network === networkId)
        },
        ...mapActions('feeds', ['init', 'initSingleContract']),
    },
    watch: {
        feeds() {
            this.filteredItems = []
        },
    },
    computed: {
        tokensInNetworks() {
            return this.feeds.map(item => ({ token: item.token, network: item.network.id }))
        },
        displayedSelectedNetworks() {
            return this.selectedNetworks.map(network => ({
                key: network,
                name: this.findNetworkImage(network),
                imageUrl: this.findNetworkImage(network)
            }))
        },
        displayedSelectedCryptos() {
            return this.selectedCryptos.map(crypto => ({
                key: crypto,
                name: crypto,
                imageUrl: this.getImageUrl(this.getTokenImage(crypto).imageName)
            }))
        },
        cryptoImages() {
            return images.filter(image => {
                const networks = this.selectedNetworks.length > 0 ? this.selectedNetworks : this.filteredNetworks
                return networks?.some(networkId => {
                    return this.tokenInNetwork(image.token, networkId)
                }
                )
            }
            )
        },
        hasFilters() {
            return this.filters && (this.filters.selectedCryptos.length > 0 || this.filters.selectedNetworks.length > 0)
        },
        totalRows() {
            return this.filteredItems.length > 0 ? this.filteredItems.length : this.feeds.length
        },
        networksMap() {
            const map = Object.values(networks).map(network => ({ label: network.name, value: network.chainId }))
            return map.filter(item => this.filteredNetworks.includes(item.value))
        },
        paginatedFeeds() {
            const startIndex = (this.currentPage - 1) * this.perPage
            const endIndex = startIndex + this.perPage
            return this.feeds?.slice(startIndex, endIndex)
        },
        ...mapGetters('feeds', [
            'combinedFeedsWithDetailsArray'
        ]),
        filteredNetworks() {
            if (this.selectedCryptos.length === 0) {
                return Object.values(networks).map(item => item.chainId)
            }

            const networkSet = new Set()
            this.displayedTableItems?.forEach(feed => {
                if (this.selectedCryptos.some(crypto => feed.feed.indexOf(crypto) >= 0)) {
                    networkSet.add(feed.network.id)
                }
            })

            return Array.from(networkSet)
        },
        filteredCurrencies() {
            if (this.selectedNetworks.length === 0) {
                return images.map(image => image.token)
            }

            const networkSet = new Set()
            this.displayedTableItems?.forEach(feed => {
                if (this.selectedNetworks.some(chainId => feed.network.id === chainId)) {
                    networkSet.add(feed.crypto_token)
                }
            })
            return Array.from(networkSet)
        },
        feeds() {
            if (this.combinedFeedsWithDetailsArray.length === 0) return []
            return this.combinedFeedsWithDetailsArray.map(transformFeed)
        }
    }
}
</script>
<style lang="scss" src="./Feeds.scss" />
