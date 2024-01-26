import * as restate from "@restatedev/restate-sdk";
import {WorkflowStep} from "../types/types";
import axios from "axios";
import * as fs from "fs";
import Jimp from "jimp";

type StableDiffusionParams = {prompt: string, steps?: number}

const run = async (ctx: restate.RpcContext, wf: WorkflowStep) => {
    const prompt = wf.parameters as {prompt: string};
    const image = await Jimp.read(wf.imgInputPath!)
    const base64EncodedImg = (await image.getBufferAsync(Jimp.MIME_PNG)).toString('base64')
    const stableDiffusionParams = {...prompt, init_images: [base64EncodedImg]};

    console.info("Generating image with stable diffusion: " + wf.method + " parameters: " + JSON.stringify(prompt))
    await transformImgWithStableDiffusion(ctx, wf.imgOutputPath!, stableDiffusionParams)

    return {
        msg: "[Generated stable diffusion image: " + wf.method + " parameters: " + JSON.stringify(prompt) + "]",
    };
}

async function transformImgWithStableDiffusion(ctx: restate.RpcContext, imgOutputPath: string, params: StableDiffusionParams) {
    const request = await ctx.sideEffect(() => axios.post("http://127.0.0.1:7860/sdapi/v1/img2img", params));
    let logoImage = await request.data.images[0];
    const decodedImage: Buffer = Buffer.from(logoImage, "base64");
    await ctx.sideEffect(async () => fs.writeFileSync(imgOutputPath, decodedImage));
}


export const router = restate.router({ run })
export type api = typeof router;
export const service: restate.ServiceApi<api> = { path: "stable-diffusion-transformer"}