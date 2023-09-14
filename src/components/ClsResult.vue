<script setup lang="ts">
import { ref } from "vue";
import {emitter} from '@/emitter';
import {ClassRegistry, AllClassNames, CountClsProps, CountClsFuncs, CountClsEnums } from "../opJson";
import type {ClassDesc, MemberDesc, EnumDesc} from "../opJson";

defineProps<{cls: ClassDesc}>()

function onClickResult(cls: ClassDesc) {
    console.log(`Clicked ${cls.name}`)
    emitter.emit('newClassTab', cls)
}

</script>


<template>
    <div class="px-1 m-1 rounded border border-stone-700 flex flex-row justify-between hover:text-rose-400 active:text-rose-600 hover:cursor-pointer select-none"
        @click="onClickResult(cls)"
    >
        <div class="w-3/4 truncate">
            {{ cls.name }}
        </div>
        <div class="w-1/4 flex flex-row">
            <div class="w-1/3">P: {{ CountClsProps(cls) }}</div>
            <div class="w-1/3">F: {{ CountClsFuncs(cls) }}</div>
            <div class="w-1/3">E: {{ CountClsEnums(cls) }}</div>
        </div>
    </div>
</template>


<style scoped>
</style>
