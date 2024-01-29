import * as restate from "@restatedev/restate-sdk";
import {WorkflowStep} from "../types/types";
import Jimp from "jimp";
import {TerminalError} from "@restatedev/restate-sdk";

export const router = restate.router({
    run: async (ctx: restate.RpcContext, wfStep: WorkflowStep) => {
        const rotateParams = wfStep.parameters as { angle: number };
        console.info("Rotating image with parameters: " + JSON.stringify(rotateParams))

        const image = await ctx.sideEffect(async () => {
            try {
                return await Jimp.read(wfStep.imgInputPath!);
            } catch (err) {
                throw new TerminalError("Error reading image: " + err)
            }
        })
        const rotatedImg = image.rotate(rotateParams.angle);
        await ctx.sideEffect(() => rotatedImg.writeAsync(wfStep.imgOutputPath!));

        return {
            msg: "[Rotated image with parameters: " + JSON.stringify(rotateParams) + "]"
        };
    }
})


export type api = typeof router;
export const service: restate.ServiceApi<api> = { path: "rotate-img-service"} // the name of the service that serves the handlers
