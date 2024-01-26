# Dynamic Workflow Executor example

This example shows how to implement a dynamic workflow executor with Restate.

The workflow executor is a service that can execute workflows with different steps.
It takes a JSON workflow definition as input and executes the steps in the order in which they are defined and with the specified parameters.

This specific example implements an image processing workflow executor.
The workflow can contain steps that call different image processing services:
- to generate images by taking a screenshot with Puppeteer or by using Stable Diffusion (with prompt specification)
- to transform images based on a prompt with Stable Diffusion
- to rotate images
- to blur images

Here is an overview of the services:

![](dynamic_workflow_executor.png)


**Note:** This app stores images locally in the `generated-images` folder. These images would of course get lost when the app is restarted. This is just a demo app, so it's not a problem. But in a real app, you would store the images in some persistent storage.

## Running the example

### Deploy Restate Server


The side effects that call stable diffusion can run for more than one minute. This is longer than the inactivity timeout of the Restate Server.
Therefore, you need to run the Restate Server with a longer inactivity timeout.

You need to run Restate with: `RESTATE_WORKER__INVOKER__INACTIVITY_TIMEOUT=1h`

For example with `npx`:
```shell
RESTATE_WORKER__INVOKER__INACTIVITY_TIMEOUT=1h npx @restatedev/restate-server@latest
```


### Deploy the services

Install the dependencies
```shell
npm install 
```

Run the services with ts-node-dev:
```shell
npm run app-dev
```

Or build and run the services with node:
```shell
npm run build
npm run app
```

Register the services at the Restate Server, using the CLI:

```shell
restate dp reg localhost:9080
```

### OPTIONAL: Install and run stable diffusion server

**Note:** You can run this demo without Stable Diffusion. In that case, you cannot use workflow steps that call Stable Diffusion.

Install stable diffusion:

```shell
mkdir stable-diffusion
cd stable-diffusion
```

Follow the steps here:
https://github.com/AUTOMATIC1111/stable-diffusion-webui?tab=readme-ov-file#installation-and-running

It may take some time to install.

Run it with:

```shell
cd stable-diffusion/stable-diffusion-webui
./webui.sh --api
```

For Linux installations, you may have to use the following options, in case you encounter errors:
`export COMMANDLINE_ARGS="--skip-torch-cuda-test --precision full --no-half"`




## Example workflow execution requests

Here is  list of example workflow execution requests that you can send to the workflow executor:

Puppeteer screenshot -> rotate -> blur:

```shell
curl localhost:8080/workflow-executor/execute -H 'content-type: application/json' -d '{"request":"{\"steps\":[{\"service\":\"puppeteer-service\",\"method\":\"rotate\",\"parameters\":{\"url\":\"https://restate.dev\"}},{\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}},{\"service\":\"blur-img-service\",\"method\":\"radial-blur\",\"parameters\":{\"blur\":5}}]}"}'
```

Puppeteer screenshot -> stable diffusion -> rotate -> blur:

```shell
curl localhost:8080/workflow-executor/execute -H 'content-type: application/json' -d '{"request":"{\"steps\":[{\"service\":\"puppeteer-service\",\"method\":\"rotate\",\"parameters\":{\"url\":\"https://restate.dev\"}},{\"service\":\"stable-diffusion-transformer\",\"method\":\"rotate\",\"parameters\":{\"prompt\":\"Change the colors to black background and pink font\", \"steps\":25}},{\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}},{\"service\":\"blur-img-service\",\"method\":\"radial-blur\",\"parameters\":{\"blur\":5}}]}"}' | jq .
```

Stable diffusion generation -> rotate -> blur:

```shell
curl localhost:8080/workflow-executor/execute -H 'content-type: application/json' -d '{"request":"{\"steps\":[{\"service\":\"stable-diffusion-generator\",\"method\":\"rotate\",\"parameters\":{\"prompt\":\"A sunny beach\", \"steps\":15}},{\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}},{\"service\":\"blur-img-service\",\"method\":\"radial-blur\",\"parameters\":{\"blur\":5}}]}"}'
```

Stable diffusion generation -> stable diffusion transformation -> rotate -> blur:

```shell
curl localhost:8080/workflow-executor/execute -H 'content-type: application/json' -d '{"request":"{\"steps\":[{\"service\":\"stable-diffusion-generator\",\"method\":\"rotate\",\"parameters\":{\"prompt\":\"A sunny beach\", \"steps\":15}},{\"service\":\"stable-diffusion-transformer\",\"method\":\"rotate\",\"parameters\":{\"prompt\":\"Make it snow on this sunny beach image\", \"steps\":15}},{\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}},{\"service\":\"blur-img-service\",\"method\":\"radial-blur\",\"parameters\":{\"blur\":5}}]}"}'
```


Puppeteer screenshot -> blur -> rotate -> rotate -> rotate -> rotate:

```shell
curl localhost:8080/workflow-executor/execute -H 'content-type: application/json' -d '{"request":"{\"steps\":[{\"service\":\"puppeteer-service\",\"method\":\"rotate\",\"parameters\":{\"url\":\"https://restate.dev\"}},{\"service\":\"blur-img-service\",\"method\":\"radial-blur\",\"parameters\":{\"blur\":5}}, {\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}}, {\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}}, {\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}}, {\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}}]}"}' 
```


Invalid workflow definition:

```shell
curl localhost:8080/workflow-executor/execute -H 'content-type: application/json' -d '{"request":"{\"steps\":[{\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}},{\"service\":\"blur-img-service\",\"method\":\"radial-blur\",\"parameters\":{\"blur\":5}}]}"}'
```


