import * as restate from "@restatedev/restate-sdk";
import {WorkflowStep} from "../types/types";

const run = async (ctx: restate.RpcContext, wf: WorkflowStep) => {
    const blurParams = wf.parameters as {blur: number};
    const blurParamsString = JSON.stringify(blurParams);
    console.info("Blurring image: " + wf.method + " parameters: " + blurParamsString)
    // do something
    return "[Blurred image: " + wf.method + " parameters: " + blurParamsString + "]";
};


export const router = restate.router({ run }) // the routes and handlers in the service
export type api = typeof router;
export const service: restate.ServiceApi<api> = { path: "blur-image-service"} // the name of the service that serves the handlers
