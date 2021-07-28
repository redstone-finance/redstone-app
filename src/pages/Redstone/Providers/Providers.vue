<template>
  <div>
    <b-row class="justify-content-center">
      <b-col cols="12" v-for="(provider, index) in providers" :key="index">
        <div class="pb-xlg" @click="$router.push('/app/provider/' + index)">
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
                  <span v-if="provider.activeFrom">
                    {{ provider.activeFrom | date }}
                  </span>
                  <vue-loaders-ball-beat
                    v-else
                    color="var(--redstone-red-color)"
                    scale="0.5"
                    ></vue-loaders-ball-beat>
                </div>
              </div>
              <div class="provider-interval">
                <div>
                  <label> Interval </label>
                </div>
                <div>
                  <span v-if="provider.currentManifest && provider.currentManifest.interval">
                    {{ formatInterval(provider.currentManifest.interval)}}
                  </span>
                  <vue-loaders-ball-beat
                    v-else
                    color="var(--redstone-red-color)"
                    scale="0.5"
                  ></vue-loaders-ball-beat>
                </div>
              </div>
              <div class="provider-points">
                <div>
                  <label> Data points </label>
                </div>
                <div>
                  <span v-if="provider.dataPoints">
                    {{ provider.dataPoints }}
                  </span>
                  <vue-loaders-ball-beat
                    v-else
                    color="var(--redstone-red-color)"
                    scale="0.5"
                  ></vue-loaders-ball-beat>  
                </div>
              </div>
              <div class="provider-stake">
                <div>
                  <label> Stake </label>
                </div>
                <div>
                  <span v-if="provider.stakedTokens !== undefined">
                    {{ provider.stakedTokens }}
                  </span>
                  <vue-loaders-ball-beat
                    v-else
                    color="var(--redstone-red-color)"
                    scale="0.5"
                  ></vue-loaders-ball-beat>  
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
    </b-row>
    <b-row v-if="providers == null" class="justify-content-center">
      <b-col
        v-for="n in 4"
        :key="n"
        cols="12"
      >
        <div class="preloader provider-card-preloader"></div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Rating from "@/components/Rating/Rating";
import _ from "lodash";
import providerMixin from "@/mixins/provider";
import { mapState } from 'vuex';

export default {
  name: "Providers",

  data() {
    return {
    };
  },

  mixins: [providerMixin],

  created() {},

  computed: {
    ...mapState("prefetch", {
      providers: (state) => { 
        return state.providers; 
      }
    }),
  },

  methods: {
    styleCategory(text, numberOfCategories, index) {
      return _.startCase(text) + (index < numberOfCategories - 1 ? ", " : "");
    }
  },

  components: {
    Rating
  },
};
</script>

<style src="./Providers.scss" lang="scss" scoped />
