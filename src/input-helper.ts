import {getInput, getMultilineInput, getBooleanInput, InputOptions} from '@actions/core'
import type {RunTaskCommandInput, AwsVpcConfiguration, ContainerOverride} from '@aws-sdk/client-ecs'
import {AssignPublicIp} from '@aws-sdk/client-ecs'

export function getNumberInput(name: string, options?: InputOptions): number {
  const stringVal = getInput(name, options)
  const numberVal = parseInt(stringVal)

  if (stringVal && isNaN(numberVal)) throw new Error(`Input is not a valid number: ${name}`)
  return numberVal
}

export function inputHelper(): [RunTaskCommandInput, number | undefined] {
  const input: RunTaskCommandInput = {
    taskDefinition: getInput('task-definition', {required: true})
  }

  // cluster
  const cluster = getInput('cluster')
  if (cluster) input.cluster = cluster

  // networkConfiguration
  const subnets = getMultilineInput('subnets')

  const awsvpcConfiguration: AwsVpcConfiguration = {
    assignPublicIp: getBooleanInput('assign-public-ip') ? AssignPublicIp.ENABLED : AssignPublicIp.DISABLED,
    subnets: subnets.length > 0 ? subnets : undefined
  }

  const securityGroups = getMultilineInput('security-groups')
  if (securityGroups.length > 0) awsvpcConfiguration.securityGroups = securityGroups

  input.networkConfiguration = {awsvpcConfiguration}

  // overrides
  const overrideContainerName = getInput('override-container-name')
  const overrideContainerCommand = getMultilineInput('override-container-command')
    .join(' ')
    .split(/\s/)
    .filter(x => x !== '')
  const overrideContainerEnvironment = getMultilineInput('override-container-environment')
  const overrideContainerCpu = getNumberInput('override-container-cpu')
  const overrideContainerMemory = getNumberInput('override-container-memory')
  const overrideContainerMemoryReservation = getNumberInput('override-container-memory-reservation')

  if (
    overrideContainerCommand.length > 0 ||
    overrideContainerEnvironment.length > 0 ||
    overrideContainerCpu ||
    overrideContainerMemory ||
    overrideContainerMemoryReservation
  ) {
    if (!overrideContainerName)
      throw new Error("Input 'override-container-name' must be provided when a container override is set")

    const containerOverride: ContainerOverride = {}
    containerOverride.name = overrideContainerName

    if (overrideContainerCommand.length > 0) containerOverride.command = overrideContainerCommand

    if (overrideContainerEnvironment.length > 0) {
      containerOverride.environment = overrideContainerEnvironment.map(line => {
        const split = line.split('=', 2)
        if (!split[0] || !split[1] || split.join('=') !== line)
          throw new Error("Input 'override-container-environment' lines must be formatted as 'NAME=VALUE'")
        return {name: split[0].trim(), value: split[1].trim()}
      })
    }

    if (overrideContainerCpu) containerOverride.cpu = overrideContainerCpu
    if (overrideContainerMemory) containerOverride.memory = overrideContainerMemory
    if (overrideContainerMemoryReservation) containerOverride.memoryReservation = overrideContainerMemoryReservation

    input.overrides = {containerOverrides: [containerOverride]}
  }

  const timeout = getNumberInput('timeout') || 600
  if (timeout < 120) throw new Error("Input 'timeout' must be greater or equal to 120")

  return [input, timeout]
}
