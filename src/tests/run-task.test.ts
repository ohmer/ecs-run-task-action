import * as github from '@actions/github'
import {ECSClient, RunTaskCommand, DescribeTasksCommand} from '@aws-sdk/client-ecs'

// https://github.com/m-radzikowski/aws-sdk-client-mock#import
import {mockClient} from 'aws-sdk-client-mock'
// https://github.com/m-radzikowski/aws-sdk-client-mock#jest-matchers
import 'aws-sdk-client-mock-jest'

import {runTask} from '../run-task'
import * as fixtures from './fixtures'

// Shallow clone original @actions/github context
const originalContext = {...github.context}

// Mock @aws-sdk/client-ecs
const ecsMock = mockClient(ECSClient)

beforeAll(() => {
  // Mock @actions/github context
  jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
    return {
      owner: fixtures.GITHUB_CONTEXT_REPO_OWNER,
      repo: fixtures.GITHUB_CONTEXT_REPO_REPO
    }
  })

  github.context.runId = fixtures.GITHUB_CONTEXT_RUN_ID
  github.context.serverUrl = fixtures.GITHUB_CONTEXT_SERVER_URL
})

afterAll(() => {
  // Restore @actions/github context
  github.context.runId = originalContext.runId
  github.context.serverUrl = originalContext.serverUrl

  // Restore
  jest.restoreAllMocks()
})

beforeEach(() => {
  ecsMock.reset()
})

afterEach(() => {
  ecsMock.restore()
})

describe('RunTask tests', () => {
  it('tags the task', async () => {
    ecsMock.on(RunTaskCommand).resolves(fixtures.AWS_ECS_RUN_TASK_COMMAND_SUCCESS)
    ecsMock.on(DescribeTasksCommand).resolves(fixtures.AWS_ECS_DESCRIBE_TASKS_COMMAND_STOPPED)

    expect.assertions(3)
    await runTask({taskDefinition: fixtures.INPUT_TASK_DEFINITION})

    expect(ecsMock).toReceiveCommandWith(RunTaskCommand, {tags: fixtures.AWS_ECS_RUN_TASK_COMMAND_INPUT_TAGS})
    expect(ecsMock).toReceiveCommand(DescribeTasksCommand)
  })

  it('fails when RunTaskCommand fails', async () => {
    ecsMock.on(RunTaskCommand).rejects()

    expect.assertions(1)
    try {
      await runTask({taskDefinition: fixtures.INPUT_TASK_DEFINITION})
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  // FIXME: this does not work, find a way to simulate waiter failing/expiring
  // it('fails when DescribeTasksCommand fails', async () => {
  //   ecsMock.on(RunTaskCommand).resolves(fixtures.AWS_ECS_RUN_TASK_COMMAND_SUCCESS)
  //   ecsMock.on(DescribeTasksCommand).resolvesOnce(fixtures.AWS_ECS_DESCRIBE_TASKS_COMMAND_RUNNING).rejects()

  //   expect.assertions(1)
  //   try {
  //     await runTask({taskDefinition: fixtures.INPUT_TASK_DEFINITION})
  //   } catch (error) {
  //     expect(error).toBeInstanceOf(Error)
  //   }

  //   expect(ecsMock).toReceiveCommand(RunTaskCommand)
  //   expect(ecsMock).toReceiveCommand(DescribeTasksCommand)
  // })
})
