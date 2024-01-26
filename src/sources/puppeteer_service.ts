import * as puppeteer from 'puppeteer';
import * as restate from "@restatedev/restate-sdk";
import {WorkflowStep} from "../types/types";

type PuppeteerParams = {url: string, viewport?: {width?: number, height?: number}}

const run = async (ctx: restate.RpcContext, wf: WorkflowStep) => {
    const puppeteerParams = wf.parameters as {url: string, viewport?: {width?: number, height?: number}};
    const puppeteerParamsString = JSON.stringify(puppeteerParams);
    console.info("Taking screenshot of website: " + wf.method + " parameters: " + puppeteerParamsString)
    const imgStoragePath = await takeWebsiteScreenshot(ctx, puppeteerParams);
    return "[Took screenshot of website: " + wf.method + " parameters: " + puppeteerParamsString + " stored at: " + imgStoragePath + "]";
}

async function takeWebsiteScreenshot(ctx: restate.RpcContext, params: PuppeteerParams) {
    const imgStoragePath = `${ctx.rand.uuidv4()}.png`;

    await ctx.sideEffect(async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({ width: params.viewport?.width ?? 1388, height: params.viewport?.height ?? 375});
        await page.goto(params.url);
        await page.screenshot({
            path: imgStoragePath
        });
        await browser.close();
    })

    return imgStoragePath;
}


export const router = restate.router({ run })
export type api = typeof router;
export const service: restate.ServiceApi<api> = { path: "puppeteer-service"}