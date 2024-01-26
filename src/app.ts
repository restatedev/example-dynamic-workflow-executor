import * as restate from "@restatedev/restate-sdk";
import * as rotateImgService from "./transformers/rotate_img_service";
import * as blurImgService from "./transformers/blur_img_service";
import * as puppeteerService from "./sources/puppeteer_service";
import {TerminalError} from "@restatedev/restate-sdk";
import {WorkflowStepProcessor, WorkflowDefinition, WorkflowStep, ProcessorType} from "./types/types";

const workflowStepRegistry = new Map<string, WorkflowStepProcessor>([
    ["puppeteer-service", {processorType: ProcessorType.SOURCE, api: puppeteerService.service, router: puppeteerService.router} as WorkflowStepProcessor],
    ["rotate-img-service", {processorType: ProcessorType.TRANSFORMER, api: rotateImgService.service, router: rotateImgService.router} as WorkflowStepProcessor],
    ["blur-img-service", {processorType: ProcessorType.TRANSFORMER, api: blurImgService.service, router: blurImgService.router} as WorkflowStepProcessor]
]);

const execute = async (ctx: restate.RpcContext, jsonWf: string) => {
    const wf = toValidatedWorkflowDefinition(jsonWf);

    let output: object[] = [];
    for(const step of wf.steps ) {
        const result = await executeWorkflowStep(ctx, step);
        output.push(result);
    }

    return {
        status: "Image transformed!",
        steps: output
    };
};


function toValidatedWorkflowDefinition(jsonWf: string){
    let wfDefinition: WorkflowDefinition;

    // Check if valid JSON
    try {
        wfDefinition = JSON.parse(jsonWf) as WorkflowDefinition;
    } catch (e) {
        throw new TerminalError("Invalid workflow definition: cannot parse JSON into workflow definition");
    }

    // Check if workflow definition has steps
    if(!wfDefinition.steps) {
        throw new TerminalError("Invalid workflow definition: no steps defined");
    }

    // Check if workflow steps are valid
    wfDefinition.steps.forEach(step => {
        if(!workflowStepRegistry.has(step.service)) {
            new TerminalError(`Invalid workflow definition: Service ${step.service} not found`)
        }
    })

    // First element needs to be a source
    const firstStep = wfDefinition.steps[0];
    if(workflowStepRegistry.get(firstStep.service)!.processorType !== ProcessorType.SOURCE) {
        throw new TerminalError(`Invalid workflow definition: First step must be a source`)
    }

    // Other elements should be transformers
    wfDefinition.steps.slice(1).forEach(step => {
        if(workflowStepRegistry.get(step.service)!.processorType !== ProcessorType.TRANSFORMER) {
            throw new TerminalError(`Invalid workflow definition: Step ${step.service} must be a transformer`)
        }
    })

    return wfDefinition;
}

async function executeWorkflowStep(ctx: restate.RpcContext, step: WorkflowStep){
    const servicePath = workflowStepRegistry.get(step.service)!;
    const result = await ctx.rpc(servicePath.api).run(step);
    return {outcome: result};
}

restate
    .createServer()
    .bindRouter("workflow-runner", restate.router({ execute }))
    .bindRouter(puppeteerService.service.path, puppeteerService.router)
    .bindRouter(rotateImgService.service.path, rotateImgService.router)
    .bindRouter(blurImgService.service.path, blurImgService.router)
    .listen(9080);