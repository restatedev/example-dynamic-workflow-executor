import {ProcessorType, WorkflowDefinition, WorkflowStep } from "../types/types";
import * as restate from "@restatedev/restate-sdk";
import {TerminalError} from "@restatedev/restate-sdk";
import {workflowStepRegistry} from "./workflow_step_registry";

export const router = restate.router({
    execute: async (ctx: restate.RpcContext, jsonWf: string) => {
        const wfDefinition = asValidatedWorkflowDefinition(jsonWf);

        // Generate a stable image storage path and add it to the workflow definition
        const imgName = ctx.rand.uuidv4();
        const wf = addImgPathToSteps(wfDefinition, imgName);

        let processorMessages: string[] = [];
        for (const step of wf.steps) {
            const result = await executeWorkflowStep(ctx, step);
            processorMessages.push(result.msg);
        }

        return {
            status: "Image transformed!",
            steps: processorMessages,
            imgStoragePath: imgName
        };
    }
})

export type api = typeof router;
export const service: restate.ServiceApi<api> = { path: "workflow-executor" };

// --------------------- Utils / helpers -------------------------------------

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

function executeWorkflowStep(ctx: restate.RpcContext, step: WorkflowStep) {
    const servicePath = workflowStepRegistry.get(step.service)!;
    return ctx.rpc(servicePath.api).run(step);
}
