import './assets/main.css'
import './index.css'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import { createApp, type App as AppT, type CreateAppFunction, createSSRApp } from 'vue'
import App from './App.vue'
import { ParseDataStructures, ShowOffsets } from './opJson';
import {emitter} from '@/emitter';
// @ts-ignore
import VueVirtualScroller from 'vue-virtual-scroller'
import * as VueRouter from 'vue-router'
import ClsSearchVue from './components/ClsSearch.vue'
import ClsDrawTabVue from './components/ClsDrawTab.vue'
import { setGameName, type GameName, getUrlBase, getWindowDefaultTitle } from './gameVariant'

const routes = [
  { path: '/', component: ClsSearchVue },
  { path: '/:name', component: ClsDrawTabVue, name: "viewClass" },
  { path: '/:name/:subName', component: ClsDrawTabVue, name: "viewClassMember" },
];


export function setupApp(game: GameName, opJsonFile: any, showOffsets: boolean = true, createAppFunc: CreateAppFunction<Element> | null = null): AppT<Element> {
    setGameName(game);
    window.document.title = getWindowDefaultTitle();
    const router = VueRouter.createRouter({

        // history: VueRouter.createWebHashHistory(),
        history: VueRouter.createWebHistory(getUrlBase()),
        routes
    })
    const app = (createAppFunc || createSSRApp)(App)
    app.use(VueVirtualScroller)
    app.use(router)
    app.config.globalProperties.emitter = emitter;
    app.mount('#app')
    ShowOffsets.value = showOffsets;
    setTimeout(() => ParseDataStructures(opJsonFile), 0);
    return app;
}
