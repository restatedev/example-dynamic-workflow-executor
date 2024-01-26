import * as restate from "@restatedev/restate-sdk";
import * as rotateImgService from "./transformers/rotate_img_service";
import * as blurImgService from "./transformers/blur_img_service";
import * as puppeteerService from "./sources/puppeteer_service";
import * as stableDiffusionGenerator from "./sources/stable_diffusion_generator";
import * as stableDiffusionTransformer from "./transformers/stable_diffusion_transformer";
import * as workflowExecutor from "./workflow-executor";

restate
    .createServer()
    .bindRouter(workflowExecutor.service.path, workflowExecutor.router)
    .bindRouter(puppeteerService.service.path, puppeteerService.router)
    .bindRouter(stableDiffusionGenerator.service.path, stableDiffusionGenerator.router)
    .bindRouter(rotateImgService.service.path, rotateImgService.router)
    .bindRouter(blurImgService.service.path, blurImgService.router)
    .bindRouter(stableDiffusionTransformer.service.path, stableDiffusionTransformer.router)
    .listen(9080);