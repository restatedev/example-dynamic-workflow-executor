import * as restate from "@restatedev/restate-sdk";
import {WorkflowStep} from "../types/types";
import axios from "axios";
import * as fs from "fs";

type StableDiffusionParams = {prompt: string, steps?: number}

const run = async (ctx: restate.RpcContext, wf: WorkflowStep) => {
    const stableDiffusionParams = wf.parameters as StableDiffusionParams;

    console.info("Generating image with stable diffusion with parameters: " + JSON.stringify(stableDiffusionParams))
    await generateStableDiffusionImg(ctx, wf.imgOutputPath!, stableDiffusionParams);

    return {
        msg: "[Generated stable diffusion image with parameters: " + JSON.stringify(stableDiffusionParams) + "]",
    };
}

async function generateStableDiffusionImg(ctx: restate.RpcContext, imgOutputPath: string, params: StableDiffusionParams) {
    // Would have been nicer to use awakeables here, if stable diffusion would support callbacks
    const generatedImg = await ctx.sideEffect(async () => {
        const request = await axios.post("http://127.0.0.1:7860/sdapi/v1/txt2img", params);
        return request.data.images[0];
    });
    const decodedImage: Buffer = Buffer.from(generatedImg, "base64");
    await ctx.sideEffect(async () => fs.writeFileSync(imgOutputPath, decodedImage));
}


export const router = restate.router({ run })
export type api = typeof router;
export const service: restate.ServiceApi<api> = { path: "stable-diffusion-generator"}