# Dynamic Workflow Executor example


Generate with puppeteer:


```shell
curl localhost:8080/workflow-runner/execute -H 'content-type: application/json' -d '{"request":"{\"steps\":[{\"service\":\"puppeteer-service\",\"method\":\"rotate\",\"parameters\":{\"url\":\"https://restate.dev\"}},{\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}},{\"service\":\"blur-img-service\",\"method\":\"radial-blur\",\"parameters\":{\"blur\":5}}]}"}'
```

Generate with stable diffusion:

```shell
curl localhost:8080/workflow-runner/execute -H 'content-type: application/json' -d '{"request":"{\"steps\":[{\"service\":\"stable-diffusion-generator\",\"method\":\"rotate\",\"parameters\":{\"prompt\":\"A sunny beach\", \"steps\":1}},{\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}},{\"service\":\"blur-img-service\",\"method\":\"radial-blur\",\"parameters\":{\"blur\":5}}]}"}'
```

```shell
curl localhost:8080/workflow-runner/execute -H 'content-type: application/json' -d '{"request":"{\"steps\":[{\"service\":\"stable-diffusion-generator\",\"method\":\"rotate\",\"parameters\":{\"prompt\":\"A sunny beach\", \"steps\":1}},{\"service\":\"stable-diffusion-transformer\",\"method\":\"rotate\",\"parameters\":{\"prompt\":\"Make it snow on this sunny beach image\", \"steps\":1}},{\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}},{\"service\":\"blur-img-service\",\"method\":\"radial-blur\",\"parameters\":{\"blur\":5}}]}"}'
```

Invalid workflow definition:

```shell
curl localhost:8080/workflow-runner/execute -H 'content-type: application/json' -d '{"request":"{\"steps\":[{\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}},{\"service\":\"blur-img-service\",\"method\":\"radial-blur\",\"parameters\":{\"blur\":5}}]}"}'
```


Then try sending this request:

```shell
curl localhost:8080/workflow-runner/execute -H 'content-type: application/json' -d '{"request":"{\"steps\":[{\"service\":\"puppeteer-service\",\"method\":\"rotate\",\"parameters\":{\"url\":\"https://restate.dev\"}},{\"service\":\"blur-img-service\",\"method\":\"radial-blur\",\"parameters\":{\"blur\":5}}, {\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}}, {\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}}, {\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}}, {\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}}]}"}' 
```


## Install and run stable diffusion server

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

I had to run with:
`export COMMANDLINE_ARGS="--skip-torch-cuda-test --precision full --no-half"`

Without these options, it threw errors for me and I didn't want to waste time on it.