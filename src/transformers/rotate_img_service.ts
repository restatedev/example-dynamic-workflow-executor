import * as restate from "@restatedev/restate-sdk";
import {WorkflowStep} from "../types/types";

const run = async (ctx: restate.RpcContext, wf: WorkflowStep) => {
    const rotateParams = wf.parameters as {angle: number};
    const rotateParamsString = JSON.stringify(rotateParams);
    console.info("Rotating image: " + wf.method + " parameters: " + rotateParamsString)
    // do something
    return "[Rotated image: " + wf.method + " parameters: " + rotateParamsString + "]";
};


export const router = restate.router({ run }) // the routes and handlers in the service
export type api = typeof router;
export const service: restate.ServiceApi<api> = { path: "rotate-img-service"} // the name of the service that serves the handlers
