<template>
    <div class="flex flex-row gap-2 max-h-100">
        <!-- tabs bar -->
        <div class="flex flex-col justify-left gap-1 w-1/6">
            <TabLabel name="Search" :can-close="false" @click="focusSearchTab()" :is-focused="focusedTab.t == 'search'" />
            <TabLabel :name="cls.name" :can-close="true" v-for="cls, ix in clsTabs" @click="focusClassTab(cls)" :is-focused="focusedTab.t == 'cls' && focusedTab.ix == ix" />
        </div>

        <!-- tab body -->

        <div class="center pt-2 w-5/6 scrollable flex flex-col">
            <div class="overflow-auto">
                <KeepAlive>
                    <ClsSearch v-if="focusedTab.t == 'search'" />
                    <ClsDrawTab v-else-if="focusedTab.t == 'cls' && clsTabs[focusedTab.ix]" :cls="clsTabs[focusedTab.ix]" />
                </KeepAlive>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { ClassDesc } from '@/opJson';
import ClsSearch from "./ClsSearch.vue";
import ClsDrawTab from "./ClsDrawTab.vue";
import TabLabel from "./TabLabel.vue";
import { ref, reactive, onMounted, defineProps, computed, getCurrentInstance } from 'vue';
import type { Ref } from 'vue';
import {emitter} from '@/emitter';

// const props = defineProps<{}>();

const clsTabs: ClassDesc[] = reactive([] as ClassDesc[]);

export type TabDesc = {
    t: "cls" | "find-type",
    cls: ClassDesc | null,
    findTy: string | null,
}

emitter.on('closeTab', (name) => closeTab(name as string))
emitter.on('closeClassTab', (cls) => closeClassTab(cls as ClassDesc))
emitter.on('closeFindTypeTab', (x) => closeFindTypeTab(x))

emitter.on('newClassTab', cls => onNewTab({t: "cls", cls: cls as ClassDesc, findTy: null}))

function onNewTab(tabD: TabDesc) {
    console.log('new tabD: ', tabD);
    if (tabD.t == "cls" && tabD.cls) {
        if (!clsTabs.includes(tabD.cls)) {
            clsTabs.push(tabD.cls)
        }
        focusClassTab(tabD.cls);
    }
}

function closeTab(name: string) {
    let cls = clsTabs.find(cls => cls.name == name);
    if (cls) closeClassTab(cls);
}

function closeClassTab(cls: ClassDesc) {
    let ix = clsTabs.findIndex(m => m.name === cls.name);
    console.log('closing cls at ix ', ix)
    if (ix < 0) return;
    if (focusedTab.t == "cls" && focusedTab.ix >= ix) {
        focusSearchTab();
        console.log('need to adjust focus ', focusedTab.ix)
        focusedTab.ix = focusedTab.ix - 1;
        if (focusedTab.ix <= 0) {
            focusedTab.t = "search";
        }
    }
    clsTabs.splice(ix, 1);
    forceUpdate();
}

function forceUpdate() {
    const instance = getCurrentInstance();
    instance?.proxy?.$forceUpdate();
}

function closeFindTypeTab(x: any) {
    // let ix = clsTabs.findIndex(m => m === cls);
    // if (ix < 0) return;
    // if (focusedTab.t == "cls" && focusedTab.ix >= ix) {
    //     focusedTab.ix--;
    // }
    // clsTabs.splice(ix, 1);
}

const focusedTab: {t: "search" | "cls" | "find-type", ix: number} = reactive({t: "search", ix: 0});

function focusClassTab(cls: ClassDesc) {
    focusedTab.t = "cls"
    focusedTab.ix = clsTabs.findIndex(m => m.name == cls.name);
    scrollToTop();
}

function focusSearchTab() {
    focusedTab.t = "search";
    focusedTab.ix = 0;
    scrollToTop();
}

function scrollToTop() {
    window.scrollTo(0, 0);
}


</script>


<style>
.scrollable {
    height: calc(100vh - 7.8rem);
}
</style>
