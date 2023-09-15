<script setup lang="ts">
import { onMounted, ref } from "vue";
import {ClassRegistry, AllClassNames, type MemberDesc, type ClassDesc, type EnumDesc, AllMemberNames, MemberToClasses, AllEnumNames, EnumToClasses, AllEnumValueNames} from "../opJson";

import ClsResult from './ClsResult.vue';
import { EnumValueToClasses } from "../opJson";
import {UpdateResults, searchResults} from './searcher';

// defineProps<{}>()

const beenMounted = ref(false);

onMounted(() => {
    if (!beenMounted.value) {
        beenMounted.value = true;
        UpdateResults();
    }
})

</script>


<template>
    <div id="results-list" class="text-left m-0">
        <div v-if="searchResults.length < 100" class="">
            <ClsResult :res="clsRes" v-for="clsRes in searchResults" />
        </div>
        <!-- :item-size="32" -->
        <!-- key-field="id" -->
        <!--  -->
        <RecycleScroller
            v-else
            class="scroller"
            :items="searchResults"
            :item-size="30"
            :buffer="1000"
            v-slot="{item, index, active}">
            <!-- <DynamicScrollerItem
                :item="item"
                :active="active"
                :size-dependencies="[]"
                :data-index="index"
            > -->
                <ClsResult :res="item" />
            <!-- </DynamicScrollerItem> -->
        </RecycleScroller>
    </div>
</template>

<style scoped>
.scroller {
  height: calc(100vh - 10rem);
  /* height: 100%; */
  /* max-height: 100%; */
}

/* .user {
  height: 32%;
  padding: 0 12px;
  display: flex;
  align-items: center;
} */
</style>
