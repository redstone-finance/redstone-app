<template>
  <div class="token-tabs" ref="tabWrapper" :class="{visible: showTabs}">
      <div id="leftArr" class="arrow" @click="scrollLeft()" v-if="showArrows">
        <i class="fa fa-angle-left"></i>
      </div>
      <div id="rightArr" class="arrow" @click="scrollRight()" v-if="showArrows">
        <i class="fa fa-angle-right"></i>
      </div>
      <b-tabs sm-pills md-tabs nav-class="bg-transparent" ref="tabScroll" :class="[{showArrows}]">                
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
      showTabs: false
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
  },

  created() {
    window.addEventListener("resize", this.resize);
    this.showTabs = true;
    this.resize();
  },

  destroyed() {
    window.removeEventListener("resize", this.resize);
  },
  
  methods: {
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

        const { searchTerm } = this.$store.state.layout;
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
      let tabs = [...this.$refs.tabScroll.$el.getElementsByTagName("li")];

      let tabsWidth = 0;

      tabs.forEach(
        tab => {
          tabsWidth += tab.offsetWidth
        }
      )

      tabs.reduce( (a, b) => {
        return a + b.offsetWidth;
      }, 0)

      return tabWrapper.offsetWidth < tabsWidth
    },
    resize() {
      this.showArrows = this.isOverflowing();
    }
  },
}
</script>

<style src="./Tokens.scss" lang="scss" scoped />
<style lang="scss">
@import '../../../styles/app';

//scrollable tabs
.token-tabs {
  visibility: hidden;
  &.visible {
    visibility: visible;
  }

  .nav-tabs {
    flex-wrap: nowrap;
    white-space: nowrap;
    overflow-y: clip;
    overflow-x: scroll;
  }

  .showArrows .nav-tabs {
    margin-left: 30px;
    max-width: calc(100% - 58px);
  }

  a {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      outline: none !important;
  }

  ::-webkit-scrollbar {
    display: none;
  }

  .arrow {
    padding: 10px;
    position: absolute;
    z-index: 2
  } 

  #leftArr {
    left: 40px;
  }

  #rightArr {
    right: 40px;
  }

  @media (max-width: breakpoint-max(sm)) {
    #leftArr {
      left: 20px;
    }

    #rightArr {
      right: 20px;
    }
  }
}
</style>
