<script setup lang="ts">
import { ClassRegistry } from '@/opJson';
import { computed, onMounted, ref, type Ref } from 'vue';
import {emitter} from '@/emitter';

const props = defineProps<{t: string | TNamePart}>()

type TypeKind = "prim" | "array" | "class";

type TNamePart = {
    tyName: string,
    k: TypeKind,
    isClass: boolean,
    outer: string,
    inner?: TNamePart
}

const parts: Ref<TNamePart | null> = ref(null);

function parseType(tyName: string): TNamePart {
    let isArray = tyName.includes("<")
    let isClass = !isArray && tyName.endsWith('@') || !!ClassRegistry[tyName]
    // let isPrim = !isArray && !isClass
    let k: TypeKind = isArray ? "array" : isClass ? "class" : "prim";
    let [outer, innerStr] = tyName.split('<', 2);
    let inner;
    if (isArray) {
        inner = parseType(innerStr.substring(0, innerStr.length - 1));
    }
    return {k, outer, inner, isClass, tyName}
}

const fullTypeName = computed(() =>
    typeof(props.t) == "string" ? props.t : props.t.tyName
)

onMounted(() => {
    parts.value = typeof(props.t) == "string" ? parseType(props.t) : props.t;
})

function viewClass(name: string) {
    return name.endsWith("@") ? name.substring(0, name.length - 1) : name;
    // emitter.emit('newClassTab', ClassRegistry[name.endsWith("@") ? name.substring(0, name.length - 1) : name]);
}
</script>

<template>
    <div class="inline-block" v-if="parts" :key="fullTypeName">
        <span v-if="!parts.isClass">{{parts.outer}}</span>
        <!-- @click="viewClass(parts.outer)" -->
        <router-link v-else :to="'/' + viewClass(parts.outer)">{{ parts.outer }}</router-link>
        <span v-if="parts.inner" >&lt;<TypeName :t="parts.inner" />&gt;</span>
    </div>
</template>
