<template>
  <div>
    <div class="mb-lg">
      <b-row>
        <b-col
          xxl="3"
          xl="4"
          lg="6"
          md="12"
          sm="12"
          xs="12"
          class="py-1 py-md-2"
          v-for="(token, index) in visibleTokens"
          :key="index"
        >
          <div
            class="pb-xlg"
            @click="
              $router.push(
                `/app/token/${
                  token.symbol.includes('/')
                    ? token.symbol.replace('/', '-')
                    : token.symbol
                }`
              )
            "
          >
            <Widget class="mb-0 token-card">
              <b-row class="token-details">
                <b-col cols="2" class="token-logo">
                  <img
                    v-if="token.logoURI"
                    :src="token.logoURI"
                    loading="lazy"
                  />
                  <span class="no-token-emoji" v-else>🤔</span>
                </b-col>
                <b-col
                  cols="5"
                  sm="4"
                  md="6"
                  class="h4 token-title pr-0"
                  v-if="isNotCurrencyToken(token)"
                >
                  {{ token.symbol | maxLength(15) }}
                  <br />
                  <div class="token-name">
                    {{ token.name }}
                  </div>
                </b-col>
                <b-col
                  cols="5"
                  sm="4"
                  md="6"
                  class="h4 token-title pr-0"
                  v-else
                >
                  {{ token.symbol }}
                  <br />
                  <div class="token-name">
                    {{ token.name }}
                  </div>
                </b-col>
                <b-col cols="5" sm="6" md="4" class="token-price pl-0">
                  <span
                    v-if="
                      (prices[token.symbol] || prices[token.symbol] === 0) &&
                      isNotCurrencyToken(token)
                    "
                  >
                    {{
                      prices[token.symbol]
                        | value({ eNotationForSmallValues: true })
                        | maxLength(8)
                    }}
                  </span>
                  <span
                    v-else-if="
                      prices[token.symbol] || prices[token.symbol] === 0
                    "
                  >
                    {{
                      prices[token.symbol]
                        | price({
                          eNotationForSmallValues: true,
                          currency: getCurrency(token),
                        })
                    }}
                  </span>

                  <vue-loaders-ball-beat
                    v-else
                    color="var(--redstone-red-color)"
                    scale="0.5"
                  ></vue-loaders-ball-beat>
                  <!-- </span> -->
                </b-col>
              </b-row>
              <b-row class="d-flex justify-content-end see-more-wrapper">
                <div class="see-more">
                  See more<i class="fa fa-angle-right" />
                </div>
              </b-row>
            </Widget>
          </div>
        </b-col>
      </b-row>
      <b-row>
        <div
          v-if="!allTokensVisible"
          v-observe-visibility="loadMoreSectionVisibilityChanged"
          class="loading-more-container"
        >
          <vue-loaders-ball-beat
            color="var(--redstone-red-color)"
            scale="0.5"
          ></vue-loaders-ball-beat>
        </div>
      </b-row>
    </div>
  </div>
</template>

<script>
  import Widget from "@/components/Widget/Widget";
  import { mapState } from "vuex";
  import showMoreTokensMixin from "@/mixins/show-more-tokens";
  import { getCurrency, isCurrencyToken } from "@/tokens";

  export default {
    name: "Tokens",

    mixins: [showMoreTokensMixin],

    props: {
      tokens: Array,
    },

    methods: {
      getCurrency,
      loadMoreSectionVisibilityChanged() {
        this.showMoreTokens();
      },

      isNotCurrencyToken(details) {
        return !isCurrencyToken(details);
      },
    },

    computed: {
      ...mapState("prices", ["prices"]),
    },

    components: {
      Widget,
    },
  };
</script>

<style lang="scss" src="./Tokens.scss" scoped />
