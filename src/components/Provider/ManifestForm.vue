<template>
  <b-modal
    id="manifest-form-modal"
    title="Prepare your manifest"
    size="xl"
    class="manifest-modal"
    @hidden="close"
  >
    <b-form @submit="onSubmit">
      <div class="accordion" role="tablist">
        <b-card no-body class="mb-1">
          <b-card-header header-tag="header" role="tab" v-b-toggle.accordion-1>
            <span>Tokens</span>
            <i class="fa" />
          </b-card-header>
          <b-collapse
            id="accordion-1"
            visible
            accordion="my-accordion"
            role="tabpanel"
          >
            <b-card-body>
              <div class="tokens-section">
                <b-row>
                  <b-col>
                    <h3 class="mb-3">Available tokens</h3>
                    <b-input-group
                      class="input-group-no-border search-input mb-3"
                    >
                      <template v-slot:prepend>
                        <b-input-group-text
                          ><i class="fi flaticon-search-2"
                        /></b-input-group-text>
                      </template>
                      <b-form-input
                        v-model="searchAvailableTokens"
                        id="search-input"
                        placeholder="Search for a token to add"
                      />
                    </b-input-group>
                    <div class="available-tokens-wrapper scrollable">
                      <Widget
                        class="mb-2 token-card"
                        v-for="(token, index) in visibleAvailableTokens"
                        :key="index"
                      >
                        <div>
                          <b-row class="token-details" @click="addToken(token)">
                            <b-col cols="2" class="token-logo">
                              <img v-if="token.logoURI" :src="token.logoURI" />
                              <span class="no-token-emoji" v-else>🤔</span>
                            </b-col>
                            <b-col class="h4 token-title pr-0">
                              {{ token.symbol }}
                              <br />
                              <div class="token-name">
                                {{ token.name }}
                              </div>
                            </b-col>
                            <b-col class="text-right">
                              <div class="add-token">
                                Add token<i class="fa fa-angle-right" />
                              </div>
                            </b-col>
                          </b-row>
                        </div>
                      </Widget>
                    </div>
                  </b-col>
                  <b-col>
                    <h3 class="mb-3">Added tokens</h3>
                    <b-input-group
                      class="input-group-no-border search-input mb-3"
                    >
                      <template v-slot:prepend>
                        <b-input-group-text
                          ><i class="fi flaticon-search-2"
                        /></b-input-group-text>
                      </template>
                      <b-form-input
                        v-model="searchAddedTokens"
                        id="search-input"
                        placeholder="Search for a token to modify"
                      />
                    </b-input-group>
                    <div class="added-tokens-wrapper scrollable">
                      <Widget
                        class="mb-2 token-card"
                        v-for="(token, index) in visibleAddedTokens"
                        :key="index"
                        :class="{ selected: index === clickedTokenIndex }"
                      >
                        <b-row
                          class="token-details"
                          @click="clickedTokenIndex == index ? clickedTokenIndex = -1 : clickedTokenIndex = index"
                        >
                          <b-col cols="2" class="token-logo">
                            <img v-if="token.logoURI" :src="token.logoURI" />
                            <span class="no-token-emoji" v-else>🤔</span>
                          </b-col>
                          <b-col class="h4 token-title pr-0">
                            {{ token.symbol }}
                            <br />
                            <div class="token-name">
                              {{ token.name }}
                            </div>
                          </b-col>
                          <b-col class="text-right">
                            <div class="modify-token">
                              Modify<i class="fa fa-angle-right" />
                            </div>
                          </b-col>
                          <b-col cols="1">
                            <div class="remove-token" @click="removeToken(token)">
                              <i class="fa fa-times"/>
                            </div>
                          </b-col>
                        </b-row>
                        <b-row
                          class="token-sources"
                          v-if="clickedTokenIndex === index"
                        >
                          <div>Sources:</div>
                          <div>
                            <multiselect
                              v-model="token.source"
                              @input="onSourceChange($event, token)"
                              :options="token.availableSources"
                              :selectLabel="''"
                              :deselectLabel="''"
                              :multiple="true"
                              :close-on-select="false"
                            ></multiselect>
                          </div>
                        </b-row>
                      </Widget>
                    </div>
                  </b-col>
                </b-row>
              </div>
            </b-card-body>
          </b-collapse>
        </b-card>

        <b-card no-body class="mb-1">
          <b-card-header
            header-tag="header"
            class="p-1"
            role="tab"
            v-b-toggle.accordion-2
          >
            <span>Manifest settings</span>
            <i class="fa" />
          </b-card-header>
          <b-collapse id="accordion-2" accordion="my-accordion" role="tabpanel">
            <b-card-body class="scrollable">
              <div class="manifest-settings">
                <b-input-group>
                  <label for="message-input">Change message:</label>
                  <b-form-input
                    v-model="manifest.changeMessage"
                    id="change-message"
                    placeholder="Manifest change message"
                  />
                </b-input-group>
                <b-input-group>
                  <label for="locked-hours-input"
                    >Locked hours:</label
                  >
                  <b-form-input
                    v-model="manifest.lockedHours"
                    min="0"
                    type="number"
                    id="locked-hours-input"
                    placeholder="Locked hours"
                  />
                  <b-form-invalid-feedback :state="lockedHoursValidation">
                    Locked hours should be a non-negative integer number.
                  </b-form-invalid-feedback>
                </b-input-group>
                <b-form-checkbox
                  id="checkbox-1"
                  v-model="showAdvanced"
                  name="checkbox-1"
                  class="show-advanced mt-3"
                >
                  Show advanced settings
                </b-form-checkbox>
                <div v-if="showAdvanced">
                  <b-input-group>
                    <label for="evmChainId">EVM Chain ID:</label>
                    <b-form-input
                      v-model="manifest.manifestData.evmChainId"
                      id="evmChainId"
                      placeholder=""
                    />
                  </b-input-group>
                  <b-input-group> 
                    <label for="interval">Interval:</label>
                    <b-form-input
                      v-model="manifest.manifestData.interval"
                      id="interval"
                      type="number"
                      placeholder=""
                    />
                  </b-input-group>
                  <b-input-group>
                    <label for="maxPriceDeviationPercent"
                      >Maximum Price Deviation Percent:</label>
                    <b-form-input
                      v-model="manifest.manifestData.maxPriceDeviationPercent"
                      type="number"
                      id="maxPriceDeviationPercent"
                      placeholder=""
                    />
                  </b-input-group>
                  <b-input-group>
                    <label for="priceAggregator">Price Aggregator:</label>
                    <b-form-input
                      v-model="manifest.manifestData.priceAggregator"
                      id="priceAggregator"
                      placeholder=""
                      disabled
                    />
                  </b-input-group>
                  <b-input-group>
                    <label for="sourceTimeout">Source timeout:</label>
                    <b-form-input
                      v-model="manifest.manifestData.sourceTimeout"
                      type="number"
                      id="sourceTimeout"
                      placeholder=""
                    />
                  </b-input-group>
                  <div>Sources:</div>
                    <div>
                      <multiselect
                        v-model="manifest.manifestData.defaultSource"
                        @input="onDefaultSourceChange($event)"
                        :options="availableDefaultSources"
                        :selectLabel="''"
                        :deselectLabel="''"
                        :taggable="true" 
                        @tag="addSourceTag"
                        :multiple="true"
                        :close-on-select="false"
                      ></multiselect>
                    </div>
                </div>
              </div>
            </b-card-body>
          </b-collapse>
        </b-card>

        <b-card no-body class="mb-1">
          <b-card-header
            header-tag="header"
            class="p-1"
            role="tab"
            v-b-toggle.accordion-3
          >
            <span>Preview and upload</span>
            <i class="fa" />
          </b-card-header>
          <b-collapse id="accordion-3" accordion="my-accordion" role="tabpanel">
            <b-card-body class="scrollable">
              <div class="preview-upload">
                <json-viewer
                  class="mt-3 viewer"
                  :value="manifest.manifestData"
                  :expand-depth="1"
                  copyable
                  sort
                ></json-viewer>
                <div class="mt-3 manifest-btn-wrapper">
                  <b-button
                    type="submit"
                    class="btn-danger btn-modal rounded-pill"
                    variant="primary"
                    >Upload manifest</b-button
                  >
                </div>
              </div>
            </b-card-body>
          </b-collapse>
        </b-card>
      </div>
    </b-form>
    <template #modal-footer>
      <div></div>
    </template>
  </b-modal>
</template>

<script>
import JsonViewer from "vue-json-viewer";
import tokensData from "redstone-node/dist/src/config/tokens.json";
import Multiselect from "vue-multiselect";
import Vue from 'vue';

export default {
  name: "ManifestForm",

  props: {
    initialManifest: null,
  },

  data() {
    return {
      manifest: {
        manifestChangeMessage: null,
        manifestLockedHours: 0,
        manifestData: {},
      },
      tokenSymbol: null,
      tokenSource: null,
      showAdvanced: false,
      searchAvailableTokens: "",
      searchAddedTokens: "",
      addedTokens: [],
      availableTokens: [],
      clickedTokenIndex: Number,
      availableDefaultSources: [
        'barchart',
        'binance',
        'bitfinex',
        'bitmart',
        'coinbase',
        'coingecko',
        'ecb',
        'ftx',
        'huobi',
        'kraken',
        'kyber',
        'sushiswap',
        'uniswap',
        'verto',
        'yahoo-finance',
      ]
    };
  },

  mounted() {
    this.$bvModal.show("manifest-form-modal");
    this.availableTokens = Object.entries(tokensData).map((element, index) => {
      return {
        id: index,
        symbol: element[0],
        logoURI: element[1].logoURI,
        name: element[1].name,
        source: [],
        availableSources: element[1].source
      };
    });
    this.initManifest();
  },

  methods: {
    initManifest() {
      if (this.initialManifest) {
        this.manifest = {};
        this.manifest.changeMessage = this.initialManifest.changeMessage;
        this.manifest.lockedHours = this.initialManifest.lockedHours ? this.initialManifest.lockedHours : 0;
        if (this.initialManifest.manifestData) {
          this.manifest.manifestData = {};
          this.manifest.manifestData.evmChainId =
            this.initialManifest.manifestData.evmChainId;
          this.manifest.manifestData.interval =
            this.initialManifest.manifestData.interval;
          this.manifest.manifestData.maxPriceDeviationPercent =
            this.initialManifest.manifestData.maxPriceDeviationPercent;
          this.manifest.manifestData.priceAggregator =
            this.initialManifest.manifestData.priceAggregator;
          this.manifest.manifestData.sourceTimeout =
            this.initialManifest.manifestData.sourceTimeout;
          this.manifest.manifestData.tokens = JSON.parse(JSON.stringify(this.initialManifest.manifestData.tokens));
          if (this.initialManifest.manifestData.defaultSource) this.manifest.manifestData.defaultSource = this.initialManifest.manifestData.defaultSource;

          this.addedTokens = this.availableTokens
            .filter(
              el => {
                return Object.entries(this.initialManifest.manifestData.tokens).some(
                  (entry) => {
                    return entry[0] == el.symbol;
                  }
                );
              }
            )
            .map(
              el => {
                return {
                  ...el,
                  source: this.initialManifest.manifestData.tokens[el.symbol].source
                }
              }
            )
        }
      } else {
        this.manifest = {};
        this.manifest.manifestData = {};
        this.manifest.manifestData.evmChainId = 1;
        this.manifest.manifestData.interval = 60000;
        this.manifest.manifestData.maxPriceDeviationPercent = 25;
        this.manifest.manifestData.priceAggregator = "median";
        this.manifest.manifestData.sourceTimeout = 50000;
        this.manifest.manifestData.defaultSource = [];
      }
    },
    onSubmit(e) {
      e.preventDefault();

      const errors = [];

      if (!this.manifest.changeMessage) {
        errors.push('Change message required.');
      }
      if (!this.lockedHoursValidation) {
        errors.push('Wrong locked hours value.');
      }
      if (!this.manifest.manifestData.interval) {
        errors.push('Interval required.');
      }
      if (!this.manifest.manifestData.maxPriceDeviationPercent) {
        errors.push('Maximum Price Deviation Percent required.');
      }
      if (!this.manifest.manifestData.sourceTimeout) {
        errors.push('Source timeout required.');
      }

      if (errors.length == 0) {
        this.$root.$emit("manifestSubmitted", this.manifest);
      } else {
        alert(errors.join("\r\n"))
      }
    },
    close(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.$root.$emit("manifestFormClosed");
    },
    addToken(token) {
      this.addedTokens.unshift(token);
      this.clickedTokenIndex = 0;
      this.availableTokens = this.availableTokens.filter((availableToken) => {
        return availableToken.id !== token.id;
      });
      Vue.set(this.manifest.manifestData.tokens, token.symbol, { source: token.source });
    },
    removeToken(token) {
      this.availableTokens.push(token);
      this.addedTokens = this.addedTokens.filter(addedToken => {
        return addedToken.id != token.id;
      })
      Vue.delete(this.manifest.manifestData.tokens, token.symbol);
    },
    filterBySearch(array, term) {
      return array.filter((element) => {
        return (
          element.symbol.toLowerCase().includes(term.toLowerCase()) ||
          element.name.toLowerCase().includes(term.toLowerCase())
        );
      });
    },
    onSourceChange(value, token) {
      Vue.set(this.manifest.manifestData.tokens[token.symbol], 'source', value);
    },
    onDefaultSourceChange(value) {
      Vue.set(this.manifest.manifestData, 'defaultSource', value);
    },
    addSourceTag(newTag) {
      this.availableDefaultSources.push(newTag);
      this.manifest.manifestData.defaultSource.push(newTag);
    }
  },

  components: {
    JsonViewer,
    Multiselect,
  },

  computed: {
    lockedHoursValidation() {
      return parseInt(this.manifest.lockedHours) >= 0;
    },
    visibleAvailableTokens() {
      return this.filterBySearch(
        this.availableTokens,
        this.searchAvailableTokens
      ).filter(
        function(token) {
          return !this.addedTokens.some(
            addedToken => {
              return addedToken.id == token.id;
            }
          )
        }.bind(this)
      );
    },
    visibleAddedTokens() {
      return this.filterBySearch(
        this.addedTokens,
        this.searchAddedTokens
      );
    }
  },
};
</script>

<style lang="scss" scoped>
@import "~@/styles/app";
@import "bootstrap";

.card-header {
  padding: 10px 10px 10px 36px !important;
}

.tokens-section, .tokens-section .row, .tokens-section .col {
  max-height: inherit;
}

.tokens-section {
  h3, .input-group {
    margin-left: 20px;
  }
}

.viewer-wrapper {
  height: 100%;

  .viewer {
    height: 100%;
  }
}

.available-tokens-wrapper, .added-tokens-wrapper {
  max-height: inherit;
  padding-left: 20px;
  padding-top: 20px;
  padding-bottom: 150px;
  }

.search-input,
.token-card {
  width: 400px;
}

.search-input input {
  box-shadow: none;
  border: none;
  box-shadow: none;
}

.token-card {
  min-height: 40px;
  cursor: pointer;
  transition: all 0.5s ease;
  padding: 5px 5px 5px 5px;
  position: relative;

  &:hover {
    // transform: scale(1.05);
    position: relative;
  }

  .row {
    margin-right: 10px;
    margin-left: 10px;
  }

  .token-details {
    display: flex;
    align-items: center;
    grid-template-columns: 40px auto 80px;

    > div {
      padding-left: 0;
      padding-right: 0;
    }

    .no-token-emoji {
      font-size: 20px;
    }

    .token-logo img {
      width: 30px;
      max-width: 30px;
      height: 30px;
      max-height: 30px;
    }

    .token-title {
      margin-bottom: 0px;
      margin-left: 5px;
      font-size: 18px;
      white-space: nowrap;

      .token-name {
        font-size: 12px;
        color: gray;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }

  .token-sources {
    flex-direction: column;
    font-size: 12px;
    margin-top: 10px;
  }

  .add-token,
  .modify-token {
    display: none;
  }

  &:hover .add-token,
  &:not(.selected):hover .modify-token {
    display: block;
    color: var(--redstone-red-color);
    margin-right: 20px;
    font-size: $font-size-mini;

    i {
      margin-left: 5px;
      font-size: 1.25rem;
      transform: translateY(2px);
    }
  }
}

.remove-token {
  text-align: right;
}

.input-group-text {
  border: 0;
  background-color: #f9fafe;
}

.input-group input {
  background-color: #f9fafe;
}

.card-body {
  max-height: 60vh;
  margin-top: 1px;
}

.scrollable {
  overflow: scroll;
}

.scrollable::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollable {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.tokens-section:after, .preview-upload:after {
    pointer-events: none;
    content: "";
    width: 100%;
    height: 80px;
    display: block;
    position: absolute;
    background: -webkit-linear-gradient(
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 1) 100%
    ); 
    background-image: -moz-linear-gradient(
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 1) 100%
    );
    background-image: -o-linear-gradient(
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 1) 100%
    );
    background-image: linear-gradient(
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 1) 100%
    );
    background-image: -ms-linear-gradient(
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 1) 100%
    );
    bottom: 0;
    left: 0;
    z-index: 10;
}

.card-header {
  @extend .h4;
  @extend .p-2;
  @extend .pl-4;
  cursor: pointer;
  display: flex;
  justify-content: space-between;

  i {
    transform: translateY(5px);
    font-size: 16px;
    vertical-align: middle;
  }

  &.collapsed {
    i::before {
      content: "\f078";
    }
  }

  &.not-collapsed {
    i::before {
      content: "\f077";
    }
  }
}

.modal-content {
  height: 80vh;
}

.manifest-btn-wrapper {
  position: sticky;
  bottom: 10px;
  text-align: right;
  z-index: 20;
}

.input-group {
  justify-content: space-between;
  margin-bottom: 10px;
  width: 70%;
}

</style>
<style lang="scss">
@import "~@/styles/app";

#manifest-form-modal {
  .multiselect__select,
  .multiselect__tags,
  .multiselect__single,
  .multiselect__input,
  .multiselect__element {
    font-size: 12px !important;
  }

  .multiselect__input {
    border: none;
  }

  .multiselect__option--selected {
    font-weight: $font-weight-soft-bold !important;
  }

  .card-header {
    cursor: pointer;
  }

  .token-card {
    position: relative;
  }

  .manifest-settings {
    margin-left: 20px;

    label {
      font-weight: $font-weight-thin;
    }

    .show-advanced > label {
      font-weight: $font-weight-normal;
    }

    input {
      max-width: 50%;
    }

    .custom-control-label {
      &::before, &::after {
        top: 1px;
      }
    }

    .custom-checkbox, .custom-checkbox > label {
      cursor: pointer;
    }
  }
}
</style>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

