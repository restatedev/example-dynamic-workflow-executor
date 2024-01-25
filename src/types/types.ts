import * as restate from "@restatedev/restate-sdk";
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

export type ServiceDefinition = {
    api: ServiceApi<router>,
    router: router
}