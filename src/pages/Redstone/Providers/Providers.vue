<template>
<b-row>
  <b-col cols="12" v-for="(provider, index) in providers" :key="index">
    <div class="pb-xlg" @click="$router.push('/app/provider/' + provider.id)">
      <Widget class="mb-0 provider-card">
        <div class="provider-details">
          <div class="provider-logo">
            <img v-if="provider.imgUrl" :src="provider.imgUrl">
          </div>
          <h6 class="provider-name">
            {{ provider.name }}
          </h6>
          <!-- <Rating :value="provider.rating" :disabled="true"></Rating> -->
          <h6 class="provider-description">
            {{ provider.description }}
          </h6>
          <!-- <div class="provider-categories">
            <span v-for="(category, index) in provider.categories" :key="category">{{ styleCategory(category, provider.categories.length, index) }}</span>
          </div> -->
          <div class="provider-active-date">
            <div>
              <label>
                Active from
              </label>
            </div>
            <div>
             {{ provider.activeDate }}
            </div>
          </div>
          <div class="provider-interval">
            <div>
              <label>
                Interval
              </label>
            </div>
            <div>
             {{ provider.interval }}
            </div>
          </div>
          <div class="provider-points">
            <div>
              <label>
                Data points
              </label>
            </div>
            <div>
             {{ provider.datapoints }}
            </div>
          </div>
          <div class="provider-stake">
            <div>
              <label>
                Stake
              </label>
            </div>
            <div>
             {{ provider.stake }}
            </div>
          </div>
          <!-- <div class="provider-tokens">
            <img v-for="(token, index) in provider.tokens" :key="index" :src="token.logoURI" />
          </div> -->
          <div class="provider-www">
            <a :href="provider.url" target="_blank" @click.stop="() => {}">
              <i class='fi flaticon-www'/>
            </a>
          </div>
          <!-- <b-button class="btn-lg btn-danger btn-www rounded-pill" v-b-modal.modal-1 variant="primary">WWW</b-button> -->
          <!-- <b-button class="btn-lg btn-danger btn-modal rounded-pill" v-b-modal.modal-1 variant="primary">Manifest</b-button> -->
          <!-- <b-modal id="modal-1" title="Code snippet" size="xl" ok-only>
            <Manifest :manifest="provider.manifest" />
          </b-modal> -->
        </div>
      </Widget>
    </div>
  </b-col>
</b-row>
</template>

<script>
import Rating from "@/components/Rating/Rating";
import _ from 'lodash';
import providersData from "./mock-providers.json";

export default {
  name: "Providers",

  data() {
    return {
      providers: [
        providersData
      ]
    };
  },

  created() {
  },

  mounted() {
    this.providers = this.getProviders();
  },

  methods: {
    styleCategory(text, numberOfCategories, index) {
      return _.startCase(text) + (index < numberOfCategories - 1 ? ", " : "" );
    },
    getProviders() {
      return [...providersData.result]
    }
  },
        

  components: {
    Rating
  },

  computed: {
  
  },
}
</script>

<style src="./Providers.scss" lang="scss" scoped />
