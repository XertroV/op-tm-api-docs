import { ref } from 'vue';
import OpJson from './OpenplanetNext_with_offsets.json';

export default OpJson;

export type _ClassRegistry = Record<string, ClassDesc>;
export const ClassRegistry: _ClassRegistry = {};
export const NamespaceRegistry: Record<string, _ClassRegistry> = {};
export const AllClassNames = [] as string[];
export const Versions: {game: string, op: string} = {game: "?", op: "?"};

export const JsonIsLoaded = ref(false);

// export function JsonIsLoaded() {
//     return _jsonIsLoaded;
// }

export function ParseDataStructures() {
    if (JsonIsLoaded.value) return;
    Versions.game = OpJson['mp'];
    Versions.op = OpJson['op'];
    const nss: Record<string, any> = OpJson.ns;
    const namespaces = Object.keys(nss);
    namespaces.forEach(nsName => {
        let objsInNs = nss[nsName];
        const classNames = Object.keys(objsInNs);
        classNames.forEach(clsName => {
            let cls = objsInNs[clsName];
            let clsBase = cls['p'];
            let clsCanCreate = cls['c'] == 1;
            let clsMembers = cls['m'] || [];
            let clsId = cls['i'];
            let clsEnums = cls['e'] || [];
            let clsFExt = cls['f'];
            let clsDocs = cls['d'];
            // CheckClassKeys(cls);
            AddClass(nsName, clsName, clsBase, clsCanCreate, clsMembers, clsId, clsEnums, clsFExt, clsDocs);
        })
    })
    AllClassNames.sort();
    // populate base classes
    AllClassNames.forEach(n => {
        let cls = ClassRegistry[n];
        if (cls.base) {
            let clsBase = ClassRegistry[cls.base];
            cls.baseClass = clsBase;
        }
    });
    setTimeout(() => JsonIsLoaded.value = true, 500);
}


function CheckKeysOf(kind: string, cls: object, ks: string[]) {
    let keys = Object.keys(cls);
    let missed = keys.filter(k => !ks.includes(k));
    if (missed.length > 0) {
        console.warn(`Missed ${kind} keys!!! ${missed}`);
        return false;
    }
    return true;
}

function CheckClassKeys(cls: object) {
    CheckKeysOf('class', cls, ['p', 'c', 'm', 'i', 'e', 'f', 'd']);
}

function CheckEnumKeys(cls: object) {
    return CheckKeysOf('Enum', cls, ['v', 'n']);
}
function CheckDocsKeys(cls: object) {
    CheckKeysOf('Docs', cls, ['d', 'o']);
}



export type ClassDesc = {
    ns: string,
    name: string,
    base: string,
    baseClass: ClassDesc | null,
    instantiable: boolean,
    members: MemberDesc[],
    membersByOffset: MemberDesc[],
    id: string,
    enums: EnumDesc[],
    fileExt: string | null,
    docs: string | null,
    nProps: number,
    nFuncs: number,
    nEnums: number,
};

export type MemberDesc = {
    doc: [number, string, number, number] | undefined;
    isConst: boolean,
    offset: number,
    offsetStr: String,
    e: EnumDesc | null,
    type: string,
    m: boolean,
    i: number,
    name: string,
    range: [number, number] | null,
    args: string | null,
    returnType: string | null,
    isFunction: boolean,
    isProc: boolean,
};

export type EnumDesc = {
    values: string[],
    name: string,
};

function AddClass(ns: string, name: string, base: string, instantiable: boolean, clsMembers: object[], id: string, clsEnums: object[], fileExt: string | null, clsDocs: any | null) {
    let members: MemberDesc[] = GenClassMembers(clsMembers, clsDocs?.o);
    let enums: EnumDesc[] = GenClassEnums(clsEnums);

    let nEnums = enums.length;
    let nProps = members.filter(m => !m.isFunction).length;
    let nFuncs = members.filter(m => m.isFunction).length;

    let membersByOffset = [...members].sort((c1, c2) => {
        if (c1.offset == c2.offset) return c1.i - c2.i;
        return c1.offset - c2.offset;
    })

    // if (clsDocs) CheckDocsKeys(clsDocs);

    let cls: ClassDesc = {
        ns,
        name,
        base,
        instantiable,
        members,
        id,
        enums,
        fileExt,
        docs: clsDocs?.d,
        nEnums, nProps, nFuncs,
        baseClass: null,
        membersByOffset,
    };

    ClassRegistry[name] = cls;
    ClassRegistry[name.toLocaleLowerCase()] = cls;
    let nsClss = NamespaceRegistry[ns] || {};
    nsClss[name] = cls;
    nsClss[name.toLocaleLowerCase()] = cls;
    NamespaceRegistry[ns] = nsClss;
    AllClassNames.push(name.toLocaleLowerCase());
}

function GenClassEnums(enums: any[]): EnumDesc[] {
    return enums.map(e =>
        // (CheckEnumKeys(e) && false) ||
        ({
        values: e.v,
        name: e.n
    }))
}

function CheckMemberKeys(cls: object) {
    CheckKeysOf('Member', cls, ['c', 'i', 't', 'r', 'a', 'o', 'e', 'n', 'm']);
}

function GenClassMembers(clsMembers: any[], docs: any[]): MemberDesc[] {
    return clsMembers.map(m => {
        let isConst = m.c == 1;
        let doc = docs?.filter(d => d[0] == m.i)[0];
        let name = m.n;
        let i = m.i;
        let isFunction = typeof(m.t) == "number";
        let returnType = m.r;
        let args = m.a;
        let type = isFunction ? `${returnType} (${args})` : m.t;
        let isProc = isFunction && m.t == 1;
        let range = m.r;
        let offset = m.o;
        let offsetStr = m.o < 65535 ? "0x" + m.o.toString(16) : "-";
        let e = m.e && GenClassEnums([m.e]);

        // what is .m??
        // if (m.m != 1 && isFunction) {
        //     console.log(m);
        // }

        // CheckMemberKeys(m);

        return {
            doc, isConst, name, i, type, isFunction, args, returnType, offset, e, m: m.m == 1, range, isProc, offsetStr
        };
    });
}





export function CountClsProps(cls: ClassDesc | null): number {
    if (!cls) return 0;
    return cls.nProps + CountClsProps(cls.baseClass);
}
export function CountClsFuncs(cls: ClassDesc | null): number {
    if (!cls) return 0;
    return cls.nFuncs + CountClsFuncs(cls.baseClass);
}
export function CountClsEnums(cls: ClassDesc | null): number {
    if (!cls) return 0;
    return cls.nEnums + CountClsEnums(cls.baseClass);
}
