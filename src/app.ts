import * as restate from "@restatedev/restate-sdk";
import * as rotateImgService from "./transformers/rotate_img_service";
import {TerminalError} from "@restatedev/restate-sdk";
import {ServiceDefinition, WorkflowDefinition} from "./types/types";
import * as blurImgService from "./transformers/blur_img_service";

// Any new workflow steps need to be added to this register
// Maybe another data structure would be better
const transformerServiceRegistry = new Map<string, ServiceDefinition>([
    ["rotate-img-service", {api: rotateImgService.service, router: rotateImgService.router} as ServiceDefinition],
    ["blur-img-service", {api: blurImgService.service, router: blurImgService.router} as ServiceDefinition]
]);


const execute = async (ctx: restate.RpcContext, jsonWf: string) => {

    // 1. Validate the workflow definition
    const wf = JSON.parse(jsonWf) as WorkflowDefinition;

    // 2. Execute the workflow
    let output: object[] = [];
    for(const step of wf.steps ){
        if(!transformerServiceRegistry.has(step.service)) {
            new TerminalError(`Service ${step.service} not found`)
        }

        const servicePath = transformerServiceRegistry.get(step.service)!;
        const response = await ctx.rpc(servicePath.api).run(step);
        output.push({outcome: response});
    }

    return {
        status: "Image transformed!",
        steps: output
    };
};

restate
    .createServer()
    .bindRouter("workflow-runner", restate.router({ execute }))
    .bindRouter(rotateImgService.service.path, rotateImgService.router)
    .bindRouter(blurImgService.service.path, blurImgService.router)
    .listen(9080);