<template>
  <div>
    <Loader v-if="loading" :class="'widget-loader'" :size="40"></Loader>
    <div v-else>
      <div class="token-tabs" ref="tabWrapper">
        <div id="leftArr" class="arrow" @click="scrollLeft()">
          <i :class="'fi flaticon-arrow-left-active'"></i>
        </div>
        <div id="rightArr" class="arrow" @click="scrollRight()">
          <i :class="'fi flaticon-arrow-left-active'"></i>
        </div>
        <b-tabs
          v-model="selectedTabIndex"
          sm-pills
          md-tabs
          nav-class="bg-transparent"
          ref="tabScroll"
          class="showArrows"
          @scroll="alert('jo')"
        >
          <b-tab v-for="(uniqueName, index) in uniqueNames" :key="index">
            <template #title>
              {{ uniqueName }}
            </template>
            <ClassicModelCard :tokens="specificFileData" :tokenNames="tokenNames"></ClassicModelCard>
          </b-tab>
        </b-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import redstone from 'redstone-api';
import { BTabs, BTab } from 'bootstrap-vue';
import Tokens from '@/components/Tokens/Tokens';
import Loader from '@/components/Loader/Loader';
import ClassicModelCard from '../../../components/ClassicModelCard/ClassicModelCard.vue';
import { getAllSupportedTokens, getOrderedProviders } from '@/tokens';
import { mapActions, mapState } from 'vuex';
import constants from '@/constants';
import { type } from 'os';

function simplifyPricesObject(pricesObj) {
  const simplifiedObj = {};
  for (const symbol in pricesObj) {
    simplifiedObj[symbol] = pricesObj[symbol].value;
  }
  return simplifiedObj;
}

export default {
  name: 'Tokens',

  data() {
    return {
      back: false,
      selectedTabIndex: 0,
      tokensData: {},
      loading: true,
      specificFileLinks: [],
      specificFileData: [],
      tokenNames: [],
    };
  },

  components: {
    TokenCards: Tokens,
    BTabs,
    BTab,
    Loader: Loader,
    ClassicModelCard,
  },

  async beforeCreate() {
    this.tokensData = await getAllSupportedTokens();
    this.loading = false;
  },

  async mounted() {
    await this.lazyLoadPricesForAllTokens();
    await this.getDataUrls();
    await this.getSpecificFileData();
    console.log(this.specificFileData);
  },

  created() {
    this.selectTabFromUrlParam();
  },

  watch: {
    selectedTabIndex(newValue) {
      if (this.$route.query['selected-tab'] != newValue) {
        this.$router.push({
          query: {
            ...this.$route.query,
            'selected-tab': newValue,
          },
        });
      }
    },

    $route() {
      this.selectTabFromUrlParam();
    },
  },

  methods: {
    ...mapActions({
      setPricesLoadingAsCompleted: 'prices/setPricesLoadingAsCompleted',
      addPrices: 'prices/addPrices',
    }),

    async getDataUrls() {
      const apiUrl =
        'https://api.github.com/repos/redstone-finance/redstone-oracles-monorepo/contents/packages/on-chain-relayer/relayer-manifests';

      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const jsonFiles = data.filter((file) => file.name.endsWith('.json'));
            jsonFiles.forEach((file) => {
              this.tokenNames.push(file.name.replace(/\.json$/, ''));
              this.specificFileLinks.push(file.download_url);
            });
          } else {
            console.error('Failed to load GitHub API data');
          }
        })
        .then(() => {
          for (const link of this.specificFileLinks) {
            this.getSpecificFileData(link);
          }
        })
        .catch((error) => {
          console.error('Failed to load GitHub API data:', error);
        });
    },
    async getSpecificFileData(link) {
      fetch(link)
        .then((response) => response.json())
        .then((data) => {
          this.specificFileData.push(data);
        });
    },
    async lazyLoadPricesForAllTokens() {
      const providersSorted = await getOrderedProviders();
      if (!this.pricesLoadingCompleted) {
        for (const provider of providersSorted) {
          const prices = await redstone.getAllPrices({ provider });
          this.addPrices(simplifyPricesObject(prices));
        }
        this.setPricesLoadingAsCompleted();
      }
    },

    selectTabFromUrlParam() {
      let selectedTabIndexFromUrl = this.$route.query['selected-tab'];
      if (selectedTabIndexFromUrl) {
        selectedTabIndexFromUrl = Number(selectedTabIndexFromUrl);
        if (selectedTabIndexFromUrl != this.selectedTabIndex) {
          this.selectedTabIndex = selectedTabIndexFromUrl;
        }
      }
    },

    getFilteredTokensWithPrices(type) {
      const result = [];
      for (const symbol of Object.keys(this.tokensData)) {
        const token = this.tokensData[symbol];
        let shouldBeAdded = true;

        if (!token) {
          continue;
        }

        if (type) {
          if (!token.tags || !token.tags.includes(type)) {
            shouldBeAdded = false;
          }
        }

        const searchTerm = this.searchTerm || '';
        const searchTermLowerCase = searchTerm.toLowerCase();
        if (searchTerm) {
          const nameIncludesSearchTerm = (token.name || '').toLowerCase().includes(searchTermLowerCase);
          const symbolIncludesSearchTerm = (symbol || '').toLowerCase().includes(searchTermLowerCase);
          const customCommentIncludesSearchTerm =
            token?.comment && token.comment.toLowerCase().includes(searchTermLowerCase);
          if (!nameIncludesSearchTerm && !symbolIncludesSearchTerm && !customCommentIncludesSearchTerm) {
            shouldBeAdded = false;
          }
        }

        if (shouldBeAdded) {
          result.push({
            symbol: symbol,
            ...token,
            price: this.prices[symbol],
          });
        }
      }
      return result;
    },

    scrollLeft() {
      let content = document.querySelector('.nav-tabs');
      content.scrollBy({
        left: -200,
        behavior: 'smooth',
      });
    },
    scrollRight() {
      let content = document.querySelector('.nav-tabs');
      content.scrollBy({
        left: 200,
        behavior: 'smooth',
      });
    },
  },

  computed: {
    ...mapState({
      searchTerm: (state) => state.layout.searchTerm,
      prices: (state) => state.prices.prices,
      pricesLoadingCompleted: (state) => state.prices.pricesLoadingCompleted,

      uniqueNames() {
        const uniqueSet = new Set(this.specificFileData.map((item) => item.chain.name));
        return Array.from(uniqueSet);
      },
    }),
  },
};
</script>

<style src="./ClassicModel.scss" lang="scss" scoped />
<style lang="scss">
@import '../../../styles/app';

//scrollable tabs
.token-tabs {
  position: relative;
  box-shadow: var(--tabs-shadow);

  ::-webkit-scrollbar {
    display: none;
  }

  .arrow {
    height: 35px;
    width: 30px;
    position: absolute;
    z-index: 2;
    cursor: pointer;
    border-bottom: 1px solid $gray-250;
    background-color: $gray-350;
    top: 9px;
    display: flex;
  }

  #leftArr {
    left: 0;
    border-top-left-radius: 5px;
    padding: 8px 5px 10px 5px;
  }

  #rightArr {
    right: 0;
    border-top-right-radius: 5px;
    padding: 8px 5px 10px 5px;

    i {
      transform: rotate(180deg);
    }
  }
}
</style>
