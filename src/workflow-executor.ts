import {ProcessorType, WorkflowDefinition, WorkflowStep, WorkflowStepProcessor} from "./types/types";
import * as puppeteerService from "./sources/puppeteer_service";
import * as stableDiffusionGenerator from "./sources/stable_diffusion_generator";
import * as rotateImgService from "./transformers/rotate_img_service";
import * as blurImgService from "./transformers/blur_img_service";
import * as stableDiffusionTransformer from "./transformers/stable_diffusion_transformer";
import * as restate from "@restatedev/restate-sdk";
import {TerminalError} from "@restatedev/restate-sdk";

const workflowStepRegistry = new Map<string, WorkflowStepProcessor>([
    //sources
    ["puppeteer-service", {processorType: ProcessorType.SOURCE, api: puppeteerService.service, router: puppeteerService.router} as WorkflowStepProcessor],
    ["stable-diffusion-generator", {processorType: ProcessorType.SOURCE, api: stableDiffusionGenerator.service, router: stableDiffusionGenerator.router} as WorkflowStepProcessor],

    //transformers
    ["rotate-img-service", {processorType: ProcessorType.TRANSFORMER, api: rotateImgService.service, router: rotateImgService.router} as WorkflowStepProcessor],
    ["blur-img-service", {processorType: ProcessorType.TRANSFORMER, api: blurImgService.service, router: blurImgService.router} as WorkflowStepProcessor],
    ["stable-diffusion-transformer", {processorType: ProcessorType.TRANSFORMER, api: stableDiffusionTransformer.service, router: stableDiffusionTransformer.router} as WorkflowStepProcessor]
]);

const execute = async (ctx: restate.RpcContext, jsonWf: string) => {
    const wfDefinition = asValidatedWorkflowDefinition(jsonWf);

    // Generate a stable image storage path and add it to the workflow definition
    const imgName = ctx.rand.uuidv4();
    const wf = addImgPathToSteps(wfDefinition, imgName);

    let processorMessages: string[] = [];
    for(const step of wf.steps) {
        const result = await executeWorkflowStep(ctx, step);
        processorMessages.push(result.msg);
    }

    return {
        status: "Image transformed!",
        steps: processorMessages,
        imgStoragePath: imgName
    };
};


function asValidatedWorkflowDefinition(jsonWf: string){
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

    // First element needs to contain a image file path or be a source
    const firstStep = wfDefinition.steps[0];
    if(workflowStepRegistry.get(firstStep.service)!.processorType !== ProcessorType.SOURCE && !firstStep.imgInputPath) {
        throw new TerminalError(`Invalid workflow definition: First step must be a source or contain an image file path`)
    }

    // Other elements should be transformers
    wfDefinition.steps.slice(1).forEach(step => {
        if(workflowStepRegistry.get(step.service)!.processorType !== ProcessorType.TRANSFORMER) {
            throw new TerminalError(`Invalid workflow definition: Step ${step.service} must be a transformer`)
        }
    })

    return wfDefinition;
}

function addImgPathToSteps(wfDefinition: WorkflowDefinition, imgName: string) {
    const enrichedWfDefinition = {...wfDefinition};
    enrichedWfDefinition.steps = wfDefinition.steps.map((step, index) => {
        // If it's the first step, and it already contains an input path then just take the raw input, otherwise take the output path of the previous step as input path
        const imgInputPath = index === 0 ? step.imgInputPath : `generated-images/${imgName}-${index - 1}.png`;
        return {...step,
            imgInputPath: imgInputPath,
            imgOutputPath: `generated-images/${imgName}-${index}.png`
        }
    })
    return enrichedWfDefinition;
}

async function executeWorkflowStep(ctx: restate.RpcContext, step: WorkflowStep){
    const servicePath = workflowStepRegistry.get(step.service)!;
    return await ctx.rpc(servicePath.api).run(step);
}

export const router = restate.router({ execute });
export type api = typeof router;
export const service: restate.ServiceApi<api> = { path: "stable-diffusion-transformer"}
