<template>
  <div class="token-tabs" ref="tabWrapper">
      <div id="leftArr" class="arrow" @click="scrollLeft()" v-if="showArrows">
        <i :class="`fi flaticon-arrow-left${leftScrollActive ? '-active' : ''}`"></i>
      </div>
      <div id="rightArr" class="arrow" @click="scrollRight()" v-if="showArrows">
        <i :class="`fi flaticon-arrow-left${rightScrollActive ? '-active' : ''}`"></i>
      </div>
      <b-tabs sm-pills md-tabs nav-class="bg-transparent" ref="tabScroll" @hook:updated="setTabsWidth" :class="[{showArrows}]" @scroll="alert('jo')">                
        <b-tab v-for="type in tokenTypes" :key="type.label">
          <template #title>
            {{type.label}} <span class="tokens-number">{{ filteredTokenWithPrices(prices, type.tag).length }}</span>
          </template>
          <TokenCards :tokens="filteredTokenWithPrices(prices, type.tag)" />
        </b-tab>
      </b-tabs> 
  </div>
</template>

<script>
import redstone from 'redstone-api';
import { BTabs, BTab } from 'bootstrap-vue';
import Tokens from "@/components/Tokens/Tokens";
import tokensData from "@/assets/data/tokens.json";

const TOKEN_TYPES = [
  {
    label: "All",
    tag: null
  },
  {
    label: "Cryptos",
    tag: "crypto"
  },
  {
    label: "Stocks",
    tag: "stocks"
  },
  {
    label: "Currencies",
    tag: "currencies"
  },
  {
    label: "ETFs",
    tag: "etfs"
  },
  {
    label: "Grains",
    tag: "grains"
  },
  {
    label: "Energies",
    tag: "energies"
  },
  {
    label: "Metals",
    tag: "metals"
  },
  {
    label: "Livestocks",
    tag: "livestocks"
  },
  {
    label: "Softs",
    tag: "softs"
  },
]

async function getAllAvailableCurrentPrices() {
  const mainPrices = await redstone.getAllPrices();
  const rapidPrices = await redstone.getAllPrices({
    provider: 'redstone-rapid',
  });
  const stocksPrices = await redstone.getAllPrices({
    provider: 'redstone-stocks',
  });

  return {
    ...mainPrices,
    ...rapidPrices,
    ...stocksPrices,
  };
}

let currentPrices;

export default {
  name: "Tokens",

  data() {
    return {
      prices: {},
      tokenTypes: TOKEN_TYPES,
      back: false,
      showArrows: false,
      leftScrollActive: false,
      rightScrollActive: true,
      tabsLength: 0
    };
  },

  components: {
    TokenCards: Tokens,
    BTabs,
    BTab,
  },

  async mounted() {
    setTimeout(() => this.resize(), 0);

    if (currentPrices) {
      this.prices = currentPrices;
    } else {
      currentPrices = await getAllAvailableCurrentPrices();
      this.prices = currentPrices;
    }

    document.getElementsByClassName("nav-tabs")[0].addEventListener('scroll', (e) =>  {
      this.leftScrollActive = this.leftScrollAvailable();
      this.rightScrollActive = this.rightScrollAvailable();
    });
  },

  created() {
    window.addEventListener("resize", this.resize);
    this.resize();
  },

  destroyed() {
    window.removeEventListener("resize", this.resize);
  },
  
  methods: {
    setTabsWidth() {
      this.tabsLength = this.calculateTabsLength();
    },
    filteredTokenWithPrices(fetchedPrices, type) {
      const result = [];

      for (const symbol of Object.keys(tokensData)) {
        const token = tokensData[symbol];
        let shouldBeAdded = true;

        if (type) {
          if (!token.tags || !token.tags.includes(type)) {
            shouldBeAdded = false;
          }
        }

        const searchTerm = this.searchPhrase;
        const searchTermLowerCase = searchTerm.toLowerCase();
        if (searchTerm) {
          const nameIncludesSearchTerm =
            (token.name || '').toLowerCase().includes(searchTermLowerCase);
          const symbolIncludesSearchTerm =
            (symbol || '').toLowerCase().includes(searchTermLowerCase);
          if (!nameIncludesSearchTerm && !symbolIncludesSearchTerm) {
            shouldBeAdded = false;
          }
        }

        //TODO: remove when price fetching is corrected
        if (['BTMX', 'NPXS', 'MDX', 'AMP'].includes(symbol)) {
          shouldBeAdded = false;
        }

        if (shouldBeAdded) {
          result.push({
              symbol: symbol,
              ...token,
              price: fetchedPrices[symbol]?.value
            }
          );
        }
      }
      return result;
    },
    calculateTabsLength() {
      const tabElements = this.$refs.tabScroll?.$el.getElementsByTagName("li");
      const tabs = tabElements ? [...tabElements] : [];

      let tabsWidth = 0;

      if (tabs) {
        tabs.forEach(
          tab => {
            tabsWidth += tab.offsetWidth
          }
        )

        tabs.reduce( (a, b) => {
          return a + b.offsetWidth;
        }, 0)
      }

      return tabsWidth;
    },
    scrollLeft() {
      let content = document.querySelector(".nav-tabs");
      content.scrollBy({ 
        left: -200, 
        behavior: 'smooth' 
      });
    },
    scrollRight() {
      let content = document.querySelector(".nav-tabs");
      content.scrollBy({ 
        left: 200, 
        behavior: 'smooth' 
      });
    },
    isOverflowing() {
      let tabWrapper =  this.$refs.tabWrapper;

      return tabWrapper?.offsetWidth < this.tabsLength;
    },
    resize() {
      this.showArrows = this.isOverflowing();
    },
    leftScrollAvailable() {
      const tabs = document.getElementsByClassName("nav-tabs")[0];
      if (tabs) {
        return tabs.scrollLeft != 0;
      } else {
        return true;
      }
    },
    rightScrollAvailable() {
      const tabs = document.getElementsByClassName("nav-tabs")[0];
      if (tabs) {
        return tabs.scrollLeft + document.getElementsByClassName("nav-tabs")[0].offsetWidth < this.tabsLength;
      } else {
        return false;
      }
    }
  },

  computed: {
    searchPhrase() {
      let search = this.$route.query.search;
      return search != null ? search : '';
    }
  }
}
</script>

<style src="./Tokens.scss" lang="scss" scoped />
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
