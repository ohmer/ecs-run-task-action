import {context} from '@actions/github'
import type {RunTaskCommandInput, DescribeTasksCommandInput} from '@aws-sdk/client-ecs'
import {ECSClient, RunTaskCommand, waitUntilTasksStopped} from '@aws-sdk/client-ecs'

export async function runTask(input: RunTaskCommandInput, timeout = 600): Promise<void> {
  // Tag the task with workflow run URL to assist make tracing easier
  input.tags = [
    {
      key: 'GitHubWorkflowRunURL',
      value: `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`
    }
  ]

  const client = new ECSClient({})
  const response = await client.send(new RunTaskCommand(input))

  const failure = response.failures?.[0]
  if (failure) throw new Error(`Task ${failure?.arn} failed (${failure?.detail})`)

  const task = response.tasks?.[0]
  if (!task || !task.taskArn) throw new Error('Invalid RunTaskCommand response')

  const waiterParams = {client, maxWaitTime: timeout}
  const waiterInput: DescribeTasksCommandInput = {tasks: [task.taskArn]}
  if (input.cluster) waiterInput.cluster = input.cluster

  await waitUntilTasksStopped(waiterParams, waiterInput)
}
