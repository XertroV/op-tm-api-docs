<template>
    <div class="shrink rounded-t border px-2 py-2 hover:bg-stone-600 active:bg-stone-800 select-none flex flex-row justify-between"
        :class="isFocused ? 'bg-stone-500' : ''" @click="onclick()">
        <div class="truncate inline-block">{{ name }}</div>
        <div v-if="canClose" class="pl-2 inline-block" @click="emitter.emit('closeTab', name)">❎</div>
    </div>
</template>

<script setup lang="ts">
import { emitter } from '@/emitter';
import {defineProps, defineEmits} from 'vue'

const props = defineProps<{name: string, canClose: boolean, isFocused: boolean}>();

function onclick() {
    console.log("Clicked ", props.name);
}
</script>
