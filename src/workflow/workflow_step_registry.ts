import {ProcessorType, WorkflowStepProcessor} from "../types/types";
import * as puppeteer from "../puppeteer/puppeteer_generator";
import * as stableDiffusionGenerator from "../stable-diffusion/stable_diffusion_generator";
import * as rotateImgService from "../transformers/rotate_img_service";
import * as blurImgService from "../transformers/blur_img_service";
import * as stableDiffusionTransformer from "../stable-diffusion/stable_diffusion_transformer";

export const workflowStepRegistry = new Map<string, WorkflowStepProcessor>([
    //sources
    ["puppeteer-service", {processorType: ProcessorType.SOURCE, api: puppeteer.service, router: puppeteer.router} as WorkflowStepProcessor],
    ["stable-diffusion-generator", {processorType: ProcessorType.SOURCE, api: stableDiffusionGenerator.service, router: stableDiffusionGenerator.router} as WorkflowStepProcessor],

    //transformers
    ["rotate-img-service", {processorType: ProcessorType.TRANSFORMER, api: rotateImgService.service, router: rotateImgService.router} as WorkflowStepProcessor],
    ["blur-img-service", {processorType: ProcessorType.TRANSFORMER, api: blurImgService.service, router: blurImgService.router} as WorkflowStepProcessor],
    ["stable-diffusion-transformer", {processorType: ProcessorType.TRANSFORMER, api: stableDiffusionTransformer.service, router: stableDiffusionTransformer.router} as WorkflowStepProcessor]
]);