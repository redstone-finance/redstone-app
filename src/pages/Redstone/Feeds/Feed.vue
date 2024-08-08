<template>
    <div class="feed-details">
        <div class="feed-details__infos">
            <div class="applicant-info">
                <div class="applicant-info__header">
                    <h3 class="applicant-info__title">{{ feedData.feed }}</h3>
                    <p class="applicant-info__description">{{feedData}}</p>
                </div>
                <div class="applicant-info__content">
                    <dl class="applicant-info__list">
                        <div class="applicant-info__item">
                            <dt class="applicant-info__label">Answer</dt>
                            <dd class="applicant-info__value">
                                <span class="applicant-info__text">0.0001044191</span>
                            </dd>
                        </div>
                        <div class="applicant-info__item">
                            <dt class="applicant-info__label">Network</dt>
                            <dd class="applicant-info__value">
                                <img class="feeds__token-image" v-if="feedData" :src="feedData.network.image" :alt="feedData.network.name">
                                <span class="applicant-info__text">{{ feedData.network.name }}</span>
                            </dd>
                        </div>
                        <div class="applicant-info__item">
                            <dt class="applicant-info__label">Trigger parameters</dt>
                            <dd class="applicant-info__column-value">
                                <div class="applicant-info__item">
                            <dt class="applicant-info__label">Deviation threshold
                            </dt>
                            <dd class="applicant-info__value">
                                <span class="applicant-info__text">2</span>
                            </dd>
                        </div>
                        <div class="applicant-info__item">
                            <dt class="applicant-info__label">Heartbeat</dt>
                            <dd class="applicant-info__value">
                                <span class="applicant-info__text">22:05:50</span>
                            </dd>
                        </div>
                        </dd>
                </div>
                <div class="applicant-info__item">
                    <dt class="applicant-info__label">Last update</dt>
                    <dd class="applicant-info__value">
                        <span class="applicant-info__text">
                            <div class="date-subvalue">August 5, 2024</div>
                            <div>1 hour ago</div>
                        </span>
                    </dd>
                </div>
                </dl>
            </div>
        </div>
    </div>
    <div class="feed-chart">
        <layer-chart :data="sampleData" />
    </div>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import LayerChart from "./components/LayerChart"
import { transformFeed } from './feedUtils';

export default {
    components: {
        LayerChart
    },
    data() {
        return {
            chartData: [],
            isLoading: false,
            sampleData: [{ timeStamp: "2024-08-01 08:15:30", action: "Login" },
            { timeStamp: "2024-08-01 09:30:45", action: "View Profile" },
            { timeStamp: "2024-08-01 11:20:15", action: "Update Settings" },
            { timeStamp: "2024-08-02 10:05:00", action: "Post Comment" },
            { timeStamp: "2024-08-02 14:45:30", action: "Like Post" },
            { timeStamp: "2024-08-02 16:30:00", action: "Share Content" },
            { timeStamp: "2024-08-02 18:20:15", action: "Logout" },
            { timeStamp: "2024-08-03 09:00:00", action: "Login" },
            { timeStamp: "2024-08-03 11:30:45", action: "Send Message" },
            { timeStamp: "2024-08-04 13:15:30", action: "View Profile" },
            { timeStamp: "2024-08-04 15:45:00", action: "Update Status" },
            { timeStamp: "2024-08-04 17:30:15", action: "Like Post" },
            { timeStamp: "2024-08-04 19:00:30", action: "Logout" },
            { timeStamp: "2024-08-05 08:30:00", action: "Login" },
            { timeStamp: "2024-08-05 10:15:45", action: "Post Comment" },
            { timeStamp: "2024-08-05 12:00:30", action: "Share Content" },
            { timeStamp: "2024-08-05 14:30:15", action: "Send Message" },
            { timeStamp: "2024-08-05 16:45:00", action: "Update Settings" },
            { timeStamp: "2024-08-05 18:20:30", action: "Logout" }]
        };
    },

    async mounted() {
        this.initSingleContract(this.relayerId).then(async () => {

        })
    },
    methods: {
        ...mapActions('feeds', ['initSingleContract'])
    },
    computed: {
        network() {
            return this.$route.params.network
        },
        token() {
            return this.$route.params.token
        },
        feedData() {
            return transformFeed(this.combinedFeedsWithDetailsArray.find(feed => feed.routeNetwork === this.network && feed.routeToken === this.token))
        },
        ...mapState('feeds', ['relayersDetails', 'relayersSchema']),
        ...mapGetters('feeds', [
            'combinedFeedsWithDetailsArray'
        ]),
        layer() {
            return this.relayersSchema[this.layerId]
        },
    }
}
</script>
<style lang="scss" scoped src="./Feed.scss" />