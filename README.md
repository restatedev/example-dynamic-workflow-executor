# Dynamic Workflow Executor example


Try sending this request:


```shell
curl localhost:8080/workflow-runner/execute -H 'content-type: application/json' -d '{"request":"{\"steps\":[{\"service\":\"puppeteer-service\",\"method\":\"rotate\",\"parameters\":{\"url\":\"https://restate.dev\"}},{\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}},{\"service\":\"blur-img-service\",\"method\":\"radial-blur\",\"parameters\":{\"blur\":0.5}}]}"}'
```


```shell
curl localhost:8080/workflow-runner/execute -H 'content-type: application/json' -d '{"request":"{\"steps\":[{\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}},{\"service\":\"blur-img-service\",\"method\":\"radial-blur\",\"parameters\":{\"blur\":0.5}}]}"}'
```


Then try sending this request:

```shell
curl localhost:8080/workflow-runner/execute -H 'content-type: application/json' -d '{"request":"{\"steps\":[{\"service\":\"puppeteer-service\",\"method\":\"rotate\",\"parameters\":{\"url\":\"https://restate.dev\"}},{\"service\":\"blur-img-service\",\"method\":\"radial-blur\",\"parameters\":{\"blur\":0.5}}, {\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}}, {\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}}, {\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}}, {\"service\":\"rotate-img-service\",\"method\":\"rotate\",\"parameters\":{\"angle\":90}}]}"}' 
```