<template>
  <b-row class="justify-content-center">
    <b-col cols="12" v-for="(provider, index) in providersList" :key="index">
      <div class="pb-xlg" @click="$router.push('/app/provider/' + provider.id)">
        <Widget class="mb-0 provider-card">
          <div class="provider-details">
            <div class="provider-logo">
              <img
                v-if="provider.profile.imgUrl"
                :src="provider.profile.imgUrl"
              />
            </div>
            <h6 class="provider-name">
              {{ provider.profile.name }}
            </h6>
            <!-- <Rating :value="provider.rating" :disabled="true"></Rating> -->
            <div class="provider-description">
              {{ provider.profile.description }}
            </div>
            <!-- <div class="provider-categories">
            <span v-for="(category, index) in provider.categories" :key="category">{{ styleCategory(category, provider.categories.length, index) }}</span>
          </div> -->
            <div class="provider-active-date">
              <div>
                <label> Active from </label>
              </div>
              <div>
                {{ provider.activeFrom | date }}
              </div>
            </div>
            <div class="provider-interval">
              <div>
                <label> Interval </label>
              </div>
              <div>
                {{ provider.currentManifest.interval ? formatInterval(provider.currentManifest.interval) : '-'}}
              </div>
            </div>
            <div class="provider-points">
              <div>
                <label> Data points </label>
              </div>
              <div>
                {{ provider.dataPoints }}
              </div>
            </div>
            <div class="provider-stake">
              <div>
                <label> Stake </label>
              </div>
              <div>
                {{ provider.stakedTokens }}
              </div>
            </div>
            <div class="provider-www">
              <a
                :href="provider.profile.url"
                target="_blank"
                @click.stop="() => {}"
              >
              <i class="fa fa-external-link" />
              </a>
            </div>
          </div>
        </Widget>
      </div>
    </b-col>
    <vue-loaders-ball-beat
      v-if="fetching"
      class="mt-5"
      color="var(--redstone-red-color)"
      scale="0.5"
    ></vue-loaders-ball-beat>
  </b-row>
</template>

<script>
import Rating from "@/components/Rating/Rating";
import _ from "lodash";
const axios = require("axios");
const {interactRead} = require("@kyve/query");
// const {interactRead} = require("smartweave");
import dummyWallet from "@/dummy-wallet.json";
import providerMixin from "@/mixins/provider";
import { mapState, mapActions } from "vuex";

export default {
  name: "Providers",

  data() {
    return {
      providersList: [],
      fetching: true,
    };
  },

  mixins: [providerMixin],

  created() {},

  computed: {
    ...mapState("cache", {
      providers: (state) => state.providers,
    }),
  },

  async mounted() {
    if (this.providers) {
      this.providersList = this.providers;
    } else {
      this.providersList = await this.getProviders();
      this.updateProviders(this.providersList);
    }

    this.fetching = false;
  },

  methods: {
    ...mapActions("cache", ["updateProviders"]),

    styleCategory(text, numberOfCategories, index) {
      return _.startCase(text) + (index < numberOfCategories - 1 ? ", " : "");
    },

    async getProviders() {
      let providersData = await interactRead(
        this.kyvePoolId,
        await this.providersRegistryContractId(),
         {
            function: "providersData",
            data: {
              eagerManifestLoad: true
            }
          },
        dummyWallet
      );
      // let providersData = await interactRead(
      //   this.arweave,
      //   dummyWallet,
      //   await this.providersRegistryContractId(),
      //    {
      //       function: "providersData",
      //       data: {
      //         eagerManifestLoad: true
      //       }
      //     }
      // );


      let providersArray = [];

      for (var o in providersData.providers) {
        const currentManifestTxId = providersData.providers[o].manifests
          .slice(-1)
          .pop().manifestTxId;
        const firstManifestTxId =
          providersData.providers[o].manifests[0].manifestTxId;
        const currentManifest = await axios.get(
          `https://arweave.net/tx/${currentManifestTxId}/data.json`
        );
        const firstManifest = await axios.get(
          `https://arweave.net/tx/${firstManifestTxId}/data.json`
        );

        const transactionTime = await this.transactionTime(firstManifestTxId);
        const lockedHours = firstManifest.data.lockedHours
          ? firstManifest.data.lockedHours
          : 0;
        const activeFrom = this.activeFrom(transactionTime, lockedHours);
        const dataPoints = this.dataPoints(
          currentManifest.data.interval,
          activeFrom
        );

        providersArray.push({
          id: o,
          ...providersData.providers[o],
          currentManifest: currentManifest.data,
          activeFrom: activeFrom,
          dataPoints: dataPoints,
        });
      }

      return providersArray;
    },
  },

  components: {
    Rating,
  },
};
</script>

<style src="./Providers.scss" lang="scss" scoped />
