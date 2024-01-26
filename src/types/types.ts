import {ServiceApi} from "@restatedev/restate-sdk";

export type WorkflowStep = {
    service: string;
    method: string;
    parameters: any;
}

export type WorkflowDefinition = {
    steps: Array<WorkflowStep>;
}

export type router = { run: (wf: WorkflowStep) => Promise<string>; }

// Any new workflow steps need to be added to this register
// Maybe another data structure would be better
export enum ProcessorType {
    SOURCE = "source",
    TRANSFORMER = "transformer"
}

export type WorkflowStepProcessor = {
    processorType: ProcessorType,
    api: ServiceApi<router>,
    router: router
}