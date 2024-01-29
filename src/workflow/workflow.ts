import * as restate from "@restatedev/restate-sdk";
import * as workflowExecutor from "./workflow_executor";
import * as workflowStatus from "./workflow_status";

restate
    .createServer()
    .bindRouter(workflowExecutor.service.path, workflowExecutor.router)
    .bindRouter(workflowStatus.service.path, workflowStatus.router)
    .listen(9080);