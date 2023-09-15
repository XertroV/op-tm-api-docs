import { ref, type Ref } from "vue";

export type GameName = "next" | "mp4" | "turbo";

export const gameName: Ref<GameName> = ref("next");

export const currentPageTitle: Ref<string> = ref("");

export function setGameName(name: GameName) {
    gameName.value = name;
}

export function getGameName() {
    return gameName.value;
}

export function getPrettyGameName(): string {
    if (gameName.value == "next") return "TM2020"
    if (gameName.value == "turbo") return "Turbo"
    if (gameName.value == "mp4") return "MP4"
    return "Unknown"
}

const baseDir = '/op-tm-api-docs'
export function getUrlBase(): string {
    if (gameName.value == "turbo") return baseDir + "/turbo"
    if (gameName.value == "mp4") return baseDir + "/mp4"
    return baseDir + "/next"
}

export function getWindowDefaultTitle(): string {
    return getPrettyGameName() + ": Openplanet API Docs"
}

export function getPageTitle(pageName: string) {
    return `${pageName} | ${getWindowDefaultTitle()}`
}

export function setTitleToPageTitle(pageName: string) {
    window.document.title = pageName ? getPageTitle(pageName) : getWindowDefaultTitle()
    currentPageTitle.value = pageName
}
