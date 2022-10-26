export const INPUT_TASK_DEFINITION = 'test-task-definition'
export const INPUT_CLUSTER = 'test-cluster'
export const INPUT_ASSIGN_PUBLIC_IP = false
export const INPUT_SECURITY_GROUPS = ['sg-test']
export const INPUT_SUBNETS = ['subnet-test']
export const INPUT_OVERRIDE_CONTAINER_NAME = 'test-container-name'
export const INPUT_OVERRIDE_CONTAINER_COMMAND = ['test-container-command', '--opt', 'value']
export const INPUT_OVERRIDE_CONTAINER_ENVIRONMENT = ['TEST_NAME_1=TEST_VALUE_1', 'TEST_NAME_2=TEST_VALUE_2']
export const INPUT_OVERRIDE_CONTAINER_CPU = '1024'
export const INPUT_OVERRIDE_CONTAINER_MEMORY = '2048'
export const INPUT_OVERRIDE_CONTAINER_MEMORY_RESERVATION = '1024'
export const INPUT_TIMEOUT = '180'

export const PARSED_OVERRIDE_CONTAINER_ENVIRONMENT = [
  {name: 'TEST_NAME_1', value: 'TEST_VALUE_1'},
  {name: 'TEST_NAME_2', value: 'TEST_VALUE_2'}
]

export const PARSED_OVERRIDE_CONTAINER_CPU = parseInt(INPUT_OVERRIDE_CONTAINER_CPU)
export const PARSED_OVERRIDE_CONTAINER_MEMORY = parseInt(INPUT_OVERRIDE_CONTAINER_MEMORY)
export const PARSED_OVERRIDE_CONTAINER_MEMORY_RESERVATION = parseInt(INPUT_OVERRIDE_CONTAINER_MEMORY_RESERVATION)
export const PARSED_TIMEOUT = parseInt(INPUT_TIMEOUT)

export const GITHUB_CONTEXT_REPO_OWNER = 'test-owner'
export const GITHUB_CONTEXT_REPO_REPO = 'test-repo'
export const GITHUB_CONTEXT_SERVER_URL = 'https://example.com'
export const GITHUB_CONTEXT_RUN_ID = 42

export const AWS_ACCOUNT_ID = '123456789012'
export const AWS_REGION = 'us-fake-1'
export const AWS_AVAILABILITY_ZONE = `${AWS_REGION}a`
export const AWS_ECS_TASK_ID = 'abcdef0123456789abcdef0123456789'
export const AWS_ECS_TASK_ARN = `arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:task/${INPUT_CLUSTER}/${AWS_ECS_TASK_ID}`

export const AWS_ECS_RUN_TASK_COMMAND_INPUT_TAGS = [
  {
    key: 'GitHubWorkflowRunURL',
    value: `${GITHUB_CONTEXT_SERVER_URL}/${GITHUB_CONTEXT_REPO_OWNER}/${GITHUB_CONTEXT_REPO_REPO}/actions/runs/${GITHUB_CONTEXT_RUN_ID}`
  }
]

export const AWS_ECS_RUN_TASK_COMMAND_SUCCESS = {
  tasks: [
    {
      attachments: [
        {
          id: 'd9e7735a-16aa-4128-bc7a-b2d51EXAMPLE',
          type: 'ElasticNetworkInterface',
          status: 'ATTACHED',
          details: [
            {
              name: 'subnetId',
              value: 'subnet-0d0eab1bb3EXAMPLE'
            },
            {
              name: 'networkInterfaceId',
              value: 'eni-0fa40520aeEXAMPLE'
            },
            {
              name: 'macAddress',
              value: '0e:89:76:28:07:b3'
            },
            {
              name: 'privateDnsName',
              value: 'ip-10-0-1-184.ec2.internal'
            },
            {
              name: 'privateIPv4Address',
              value: '10.0.1.184'
            }
          ]
        }
      ],
      attributes: [
        {
          name: 'ecs.cpu-architecture',
          value: 'x86_64'
        }
      ],
      availabilityZone: AWS_AVAILABILITY_ZONE,
      clusterArn: `arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:cluster/${INPUT_CLUSTER}`,
      connectivity: 'CONNECTED',
      connectivityAt: new Date(),
      containers: [
        {
          containerArn: `arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:container/${INPUT_CLUSTER}/74de0355a10a4f979ac495c14EXAMPLE/aad3ba00-83b3-4dac-84d4-11f8cEXAMPLE`,
          taskArn: `arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:task/${INPUT_CLUSTER}/${AWS_ECS_TASK_ID}`,
          name: 'web',
          image: 'nginx',
          runtimeId: '74de0355a10a4f979ac495c14EXAMPLE-265927825',
          lastStatus: 'RUNNING',
          networkBindings: [],
          networkInterfaces: [
            {
              attachmentId: 'd9e7735a-16aa-4128-bc7a-b2d51EXAMPLE',
              privateIpv4Address: '10.0.1.184'
            }
          ],
          healthStatus: 'UNKNOWN',
          cpu: '99',
          memory: '100'
        }
      ],
      cpu: '256',
      createdAt: new Date(),
      desiredStatus: 'RUNNING',
      enableExecuteCommand: false,
      group: 'service:tdsevicetag',
      healthStatus: 'UNKNOWN',
      lastStatus: 'RUNNING',
      launchType: 'FARGATE',
      memory: '512',
      overrides: {
        containerOverrides: [],
        inferenceAcceleratorOverrides: []
      },
      platformVersion: '1.4.0',
      platformFamily: 'Linux',
      pullStartedAt: new Date(),
      pullStoppedAt: new Date(),
      startedAt: new Date(),
      startedBy: 'ecs-svc/988401040018EXAMPLE',
      tags: AWS_ECS_RUN_TASK_COMMAND_INPUT_TAGS,
      taskArn: `arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:task/MyCluster/74de0355a10a4f979ac495c14EXAMPLE`,
      taskDefinitionArn: `arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:task-definition/webserver:2`,
      version: 3,
      ephemeralStorage: {
        sizeInGiB: 20
      }
    }
  ],
  failures: []
}

export const AWS_ECS_RUN_TASK_COMMAND_FAILURE = {
  tasks: [],
  failures: [
    {
      arn: AWS_ECS_TASK_ARN,
      detail: 'fake task failure detail'
    }
  ]
}

export const AWS_ECS_DESCRIBE_TASKS_COMMAND_RUNNING = {
  tasks: [{lastStatus: 'RUNNING'}],
  failures: []
}

export const AWS_ECS_DESCRIBE_TASKS_COMMAND_STOPPED = {
  tasks: [{lastStatus: 'STOPPED'}],
  failures: []
}
