import * as puppeteer from 'puppeteer';
import * as restate from "@restatedev/restate-sdk";
import {WorkflowStep} from "../types/types";

type PuppeteerParams = {url: string, viewport?: {width?: number, height?: number}}

const run = async (ctx: restate.RpcContext, wf: WorkflowStep) => {
    const puppeteerParams = wf.parameters as PuppeteerParams;

    console.info("Taking screenshot of website: " + wf.method + " parameters: " + JSON.stringify(puppeteerParams))
    await ctx.sideEffect(async () => takeWebsiteScreenshot(ctx, wf.imgOutputPath!, puppeteerParams));

    return {
        msg: "[Took screenshot of website: " + wf.method + " parameters: " + JSON.stringify(puppeteerParams) + "]",
    };
}

async function takeWebsiteScreenshot(ctx: restate.RpcContext, imgOutputPath: string, params: PuppeteerParams) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: params.viewport?.width ?? 1388, height: params.viewport?.height ?? 375});
    await page.goto(params.url);
    await page.screenshot({
        path: imgOutputPath
    });
    await browser.close();
}


export const router = restate.router({ run })
export type api = typeof router;
export const service: restate.ServiceApi<api> = { path: "puppeteer-service"}