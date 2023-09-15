<template>
    <div class="shrink rounded-t border hover:bg-stone-600 active:bg-stone-800 select-none flex flex-row justify-between"
        :to="`/${name}`" :class="isFocused ? 'bg-stone-700' : ''"
        :title="name">
        <router-link :to="`/${name}`" class="tab-label truncate py-1.5 px-2 inline-block h-full w-full">{{ name }}</router-link>
        <div v-if="canClose" class="px-2 py-1.5 inline-block hover:text-white hover:cursor-pointer" @click="emitter.emit('closeTab', name)">❎</div>
    </div>
</template>

<script setup lang="ts">
import { emitter } from '@/emitter';
import {defineProps, defineEmits} from 'vue'

const props = defineProps<{name: string, canClose: boolean, isFocused: boolean}>();

function onclick() {
    // console.log("Clicked ", props.name);
}
</script>

<style scoped>
a.tab-label {
    text-decoration: none;
}

a.tab-label:hover {
    background-color: inherit;
}
</style>
