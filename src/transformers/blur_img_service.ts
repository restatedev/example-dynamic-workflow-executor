import * as restate from "@restatedev/restate-sdk";
import {WorkflowStep} from "../types/types";
import Jimp from "jimp";
import {TerminalError} from "@restatedev/restate-sdk";

const run = async (ctx: restate.RpcContext, wfStep: WorkflowStep) => {
    const blurParams = wfStep.parameters as {blur: number};
    console.info("Blurring image: " + wfStep.method + " parameters: " + JSON.stringify(blurParams))

    const image = await ctx.sideEffect(async () => {
        try {
            return await Jimp.read(wfStep.imgInputPath!);
        }  catch (err) {
            throw new TerminalError("Error reading image: " + err)
        }
    })
    const blurredImg = image.blur(blurParams.blur);
    await ctx.sideEffect(() => blurredImg.writeAsync(wfStep.imgOutputPath!));

    return {
        msg: "[Blurred image: " + wfStep.method + " parameters: " + JSON.stringify(blurParams) + "]"
    };
};


export const router = restate.router({ run }) // the routes and handlers in the service
export type api = typeof router;
export const service: restate.ServiceApi<api> = { path: "blur-image-service"} // the name of the service that serves the handlers
