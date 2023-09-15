<script setup lang="ts">
import {JsonIsLoaded, Versions, ClassRegistry} from "../opJson";
import MainTabs from "./MainTabs.vue";
import ClsSearch from "./ClsSearch.vue";

defineProps<{
  msg: string
}>()

</script>

<template>
  <div class="greetings mb-4 flex flex-row justify-between">
    <h2 class="green"><span class="inline-block flex flex-row items-baseline gap-4">{{ msg }}
        <a class="text-lg" href="/op-tm-api-docs/next/">TM2020</a>
        <a class="text-lg" href="/op-tm-api-docs/mp4/">MP4</a>
        <a class="text-lg" href="/op-tm-api-docs/turbo/">Turbo</a>
      </span>
    </h2>
    <div class="text-right">
      <h3 v-if="!JsonIsLoaded">Loading...</h3>
      <div v-else>
        <h5 class="gray text-xs text-right">Openplanet Version: {{ Versions.op }}<br> Game Version: {{  Versions.game  }}</h5>
      </div>
    </div>
  </div>
  <MainTabs v-if="JsonIsLoaded"/>
</template>

<style scoped>
h2 {
  font-weight: 500;
  font-size: 1.6rem;
  position: relative;
  /* top: -10px; */
}

h3 {
  font-size: 1.2rem;
}

.gray {
  color: darkgray;
  /* text-align: center; */
}

.center {
  text-align: center;
  margin: auto;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

/* @media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
} */
</style>
