<script setup lang="ts">
import { ref, computed } from "vue";
import {emitter} from '@/emitter';
import {ClassRegistry, AllClassNames, CountClsProps, CountClsFuncs, CountClsEnums } from "../opJson";
import type {ClassDesc, MemberDesc, EnumDesc} from "../opJson";
import type { SearchResult } from "./searcher";
import { useRouter, useRoute } from 'vue-router'
const router = useRouter(); const route = useRoute();

const props = defineProps<{res: SearchResult}>()

const resType = computed(() => !!props.res.member ? "M" : !!props.res.enumName || !!props.res.enumValue ? "E" : "C")

function onClickResult({cls, member, enumName, enumValue}: SearchResult) {
    // emitter.emit('newClassTab', cls)
    if (!member && !enumName) {
        router.push(`/${cls.name}`)
    } else {
        router.push(`/${cls.name}/${member?.name || enumName}`)
    }
}

const getEnumBase = (res: SearchResult) => `${res.cls.name}` + (!!res.enumValue ? '::' + res.enumName : "")
const getEnumTerm = (res: SearchResult) => !!res.enumValue ? res.enumValue : res.enumName

const widthClass = computed(() => props.res.member || props.res.enumName ? "" : "w-3/4")

</script>


<template>
    <div v-if="!!res.cls" class="res-outer px-1 my-1 rounded border text-stone-200 border-stone-700 flex flex-row justify-between hover:text-rose-400 active:text-rose-600 hover:cursor-pointer select-none"
        @click="onClickResult(res)"
        :title="res.id"
    >
        <div class="truncate flex flex-row align-center" :class="widthClass">
            <div class="text-sm text-bold res-type-box">
                <span class="mt-0.5 inline-block text-center w-4 py-0.5 bg-orange-700" v-if="resType == 'C'" title="Class">C</span>
                <span class="mt-0.5 inline-block text-center w-4 py-0.5 bg-lime-600" v-else-if="resType == 'E'" title="Enum">E</span>
                <span class="mt-0.5 inline-block text-center w-4 py-0.5 bg-cyan-600" v-else-if="resType == 'M'" title="Member">M</span>
                &nbsp;
            </div>
            <span class="text-base font-mono h-full align-bottom text-stone-400 bg-stone-800 w-16 pt-0.5 text-right mr-1">{{ res.cls.id }}&nbsp;</span>
            <span class="font-semibold" v-if="resType == 'C'">{{ res.cls.name }}</span>
            <span class="font-semibold" v-else-if="resType == 'E'"><span class="name-base text-neutral-400">{{ getEnumBase(res) }}::</span>{{ getEnumTerm(res) }}</span>
            <span class="whitespace-collapse font-semibold truncate" v-else-if="resType == 'M'">
                <span class="doc-property-type">{{ res.member?.isFunction ? res.member.returnType : res.member?.type }}</span>
                <span>&nbsp;</span>
                <span class="name-base text-neutral-400">{{ res.cls.name }}::</span>{{ res.member?.name }}<span v-if="res.member?.isFunction">({{ res.member.args }})</span>
            </span>
        </div>

        <div v-if="resType == 'C'" class="w-1/4 flex flex-row">
            <div class="w-1/3">P: {{ CountClsProps(res.cls) }}</div>
            <div class="w-1/3">F: {{ CountClsFuncs(res.cls) }}</div>
            <div class="w-1/3">E: {{ CountClsEnums(res.cls) }}</div>
        </div>
    </div>
</template>


<style scoped>
div.res-outer:hover .name-base {
    @apply text-rose-200;
}
div.res-outer:hover .res-type-box {
    @apply text-stone-200;
}

.whitespace-collapse {
    /* white-space: collapse discard; */
    white-space: collapse;
}
</style>
