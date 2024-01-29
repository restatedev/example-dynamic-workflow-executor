import * as restate from "@restatedev/restate-sdk";


export const router = restate.router({
    get: async (ctx: restate.RpcContext, jsonWf: string) => {

    }
})


export type api = typeof router;
export const service: restate.ServiceApi<api> = { path: "workflow-executor"} // the name of the service that serves the handlers