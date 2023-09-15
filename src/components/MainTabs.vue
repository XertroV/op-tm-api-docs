<template>
    <div class="p-1 flex flex-row gap-2 items-center">
        <div class="w-1/6 mr-1.5"></div>
        <input v-model="currSearch" @input="UpdateResults" @focus="$router.push('/')" placeholder="Query (wildcards / regex supported)" class="py-1 px-2 text-white border bg-black w-1/2 rounded-lg" />
        <div v-if="regexInvalid" class="text-yellow-500 font-bold ml-2">⚠️ Invalid Regex</div>
    </div>
    <div class="flex flex-row gap-2">
        <!-- tabs bar -->
        <div class="flex flex-col justify-left gap-1 w-1/6 pt-1 scroller overflow-y-auto">
            <TabLabel name="Search" :can-close="false" @click="$router.push('/')" :is-focused="focusedTab.t == 'search'" />
            <TabLabel :name="cls.name" :can-close="true" v-for="cls, ix in clsTabs" :is-focused="focusedTab.t == 'cls' && focusedTab.ix == ix" />
        </div>

        <!-- tab body -->

        <div class="pl-2 center w-5/6 flex flex-col h-full scroller overflow-y-auto">
            <!-- scrollable h-full  -->
            <!-- <div class="overflow-auto"> -->

                <!-- <KeepAlive>
                    <ClsSearch v-if="focusedTab.t == 'search'" />
                    <div v-else-if="focusedTab.t == 'cls' && clsTabs[focusedTab.ix]" class="overflow-y-auto scroller">
                        <ClsDrawTab :cls="clsTabs[focusedTab.ix]" />
                    </div>
                </KeepAlive> -->
                <router-view v-slot="{ Component }">
                    <!-- include="ClsSearch" -->
                    <KeepAlive>
                        <component :is="Component" />
                    </KeepAlive>
                </router-view>
            <!-- </div> -->
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { ClassDesc } from '@/opJson';
import { ClassRegistry } from '@/opJson';
import ClsSearch from "./ClsSearch.vue";
import ClsDrawTab from "./ClsDrawTab.vue";
import TabLabel from "./TabLabel.vue";
import { ref, reactive, onMounted, defineProps, computed, getCurrentInstance, watch } from 'vue';
import type { Ref } from 'vue';
import {emitter} from '@/emitter';
import { setTitleToPageTitle } from '../gameVariant'

import {UpdateResults, searchResults, currSearch, regexInvalid} from './searcher';

import { useRouter, useRoute } from 'vue-router'
import { getGameName } from '@/gameVariant';
const router = useRouter(); const route = useRoute();

// const props = defineProps<{}>();

const clsTabs: ClassDesc[] = reactive([] as ClassDesc[]);

export type TabDesc = {
    t: "cls" | "find-type",
    cls?: ClassDesc,
    findTy?: string,
}

emitter.on('closeTab', (name) => closeTab(name as string))
emitter.on('closeClassTab', (cls) => closeClassTab(cls as ClassDesc))
emitter.on('closeFindTypeTab', (x) => closeFindTypeTab(x))

emitter.on('newClassTab', cls => onNewTab({t: "cls", cls: cls as ClassDesc}))

let activeClass: ClassDesc | null = null;
watch(() => route.path, (newPath: string) => {
    console.log('route name: ', route.name, Date.now());
    setTitleToPageTitle("");
    if (route.name == "viewClass" || route.name == "viewClassMember") {
        let name = route.params.name as string;
        if (!name) return;
        name = name.toLocaleLowerCase()
        let match = clsTabs.findIndex(c => c.nameLower == name)
        let cls;
        if (match < 0) {
            cls = ClassRegistry[name];
            if (cls) {
                match = clsTabs.length;
                onNewTab({t: 'cls', cls})
            }
        } else {
            cls = clsTabs[match] || clsTabs[0]
        }
        activeClass = cls;
        focusedTab.t = 'cls'
        focusedTab.ix = match;
        setTitleToPageTitle(cls.name)
    } else if (route.path == "/") {
        activeClass = null;
        focusedTab.t = 'search'
    }
})


// watch(() => localStorage.getItem(`cls-tabs.${getGameName()}`),
//     (updated) => updateTabsFromSerialized(updated as string));


function onNewTab(tabD: TabDesc) {
    console.log('new tabD: ', tabD);
    if (tabD.t == "cls" && tabD.cls) {
        if (!clsTabs.includes(tabD.cls)) {
            clsTabs.push(tabD.cls)
        }
        focusClassTab(tabD.cls);
    }
    updateLocalStorageTabs();
}

function closeTab(name: string) {
    let cls = clsTabs.find(cls => cls.name == name);
    if (cls) closeClassTab(cls);
}

function closeClassTab(cls: ClassDesc) {
    let ix = clsTabs.findIndex(m => m.name === cls.name);
    // let clsToClose = clsTabs[ix];
    if (ix < 0) return;
    clsTabs.splice(ix, 1);
    if (clsTabs.length == 0) {
        router.push('/')
    } else {
        let nextCls = clsTabs[Math.min(ix, clsTabs.length - 1)];
        router.push(`/${nextCls.name}`)
    }
    updateLocalStorageTabs();
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
    // scrollToTop();
    // router.push(`/${cls.name}`)
}

function focusSearchTab() {
    focusedTab.t = "search";
    focusedTab.ix = 0;
    // router.push(`/`)
}

function scrollToTop() {
    window.scrollTo(0, -200);
}

function updateLocalStorageTabs() {
    window.localStorage.setItem(`cls-tabs.${getGameName()}`, JSON.stringify(clsTabs.map(cls => cls.name)));
}

onMounted(() => {
    let cachedTabs = window.localStorage.getItem(`cls-tabs.${getGameName()}`);
    if (cachedTabs) {
        updateTabsFromSerialized(cachedTabs)
    }
})

function updateTabsFromSerialized(cachedTabs: string) {
    // clsTabs.splice(0, clsTabs.length)
    let seen: Record<string, boolean> = {};
    clsTabs.forEach(c => seen[c.name] = true)
    clsTabs.push(...JSON.parse(cachedTabs)
            .filter((n: string) => !seen[n])
            .map((n: string) => ClassRegistry[n] || console.warn(`Missing class: ${n}`))
            .filter((c: any) => !!c));
}

</script>


<style>
.scrollable {
    /* height: calc(100vh - 7.8rem); */
}
.scroller {
  height: calc(100vh - 10rem);
  /* height: 100%; */
  /* max-height: 100%; */
}


.scroll-enter-active {
  animation: scroll-in 0.5s ease-in-out;
}
.scroll-leave-active {
  animation: scroll-in 0.5s ease-in-out;
}
.scroll-fade-enter-from,
.scroll-fade-leave-to {
  transform: translateY(100px);
  opacity: 0;
}
/* @keyframes scroll-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
} */

</style>
