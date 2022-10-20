import pc from "picocolors";

export const loadCustomBuildParams = () =>  {
    const trueEnv = ['true', '1', 'yes'];
    const esmExternals = trueEnv.includes(
        process.env?.NEXTJS_ESM_EXTERNALS ?? 'false'
    );
    const tsconfigPath = process.env.NEXTJS_TSCONFIG_PATH
        ? process.env.NEXTJS_TSCONFIG_PATH
        : './tsconfig.json'
    console.warn(
        `${pc.green(
            'warn  -'
        )} experimental.esmExternals is ${esmExternals ? 'enabled': 'disabled'}`
    );
    return {
        esmExternals,
        tsconfigPath
    }
}
