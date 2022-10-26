import * as core from '@actions/core'
import {AssignPublicIp} from '@aws-sdk/client-ecs'
import {inputHelper, getNumberInput} from '../input-helper'
import * as fixtures from './fixtures'

// Inputs for mock @actions/core
interface Inputs {
  [index: string]: string | string[] | boolean
}

let inputs: Inputs = {}

function mockGetInput(name: string, options?: core.InputOptions): string {
  const value = inputs[name] ?? ''

  if (value instanceof Array<string>) {
    return value.join('\n')
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : ''
  }

  if (options) {
    if (options.required && !value) throw new Error(`Input required and not supplied: ${name}`)
    if (!options.trimWhitespace) return value
  }

  return value.trim()
}

function mockGetMultilineInput(name: string, options?: core.InputOptions): string[] {
  const values = mockGetInput(name, options)
    .split('\n')
    .filter(x => x !== '')

  if (options && options.trimWhitespace === false) {
    return values
  }

  return values.map(value => value.trim())
}

function mockGetBooleanInput(name: string, options?: core.InputOptions): boolean {
  return Boolean(mockGetInput(name, options))
}

beforeAll(() => {
  // Mock getInput
  jest.spyOn(core, 'getInput').mockImplementation(mockGetInput)
  jest.spyOn(core, 'getMultilineInput').mockImplementation(mockGetMultilineInput)
  jest.spyOn(core, 'getBooleanInput').mockImplementation(mockGetBooleanInput)
})

afterAll(() => {
  jest.restoreAllMocks()
})

beforeEach(() => {
  inputs = {}
  inputs['task-definition'] = fixtures.INPUT_TASK_DEFINITION
})

describe('inputHelper tests', () => {
  it('sets defaults', () => {
    const [input, timeout] = inputHelper()

    expect(input.taskDefinition).toStrictEqual(fixtures.INPUT_TASK_DEFINITION)
    expect(input.cluster).toBeUndefined()
    const awsvpcConfiguration = input.networkConfiguration?.awsvpcConfiguration
    expect(awsvpcConfiguration?.assignPublicIp).toStrictEqual(AssignPublicIp.DISABLED)
    expect(awsvpcConfiguration?.securityGroups).toBeUndefined()
    expect(awsvpcConfiguration?.subnets).toBeUndefined()
    expect(input.overrides).toBeUndefined()
    expect(timeout).toBeDefined()
  })

  it('sets all values', () => {
    inputs['cluster'] = fixtures.INPUT_CLUSTER
    inputs['assign-public-ip'] = fixtures.INPUT_ASSIGN_PUBLIC_IP
    inputs['security-groups'] = fixtures.INPUT_SECURITY_GROUPS
    inputs['subnets'] = fixtures.INPUT_SUBNETS
    inputs['override-container-name'] = fixtures.INPUT_OVERRIDE_CONTAINER_NAME
    inputs['override-container-command'] = fixtures.INPUT_OVERRIDE_CONTAINER_COMMAND
    inputs['override-container-environment'] = fixtures.INPUT_OVERRIDE_CONTAINER_ENVIRONMENT
    inputs['override-container-cpu'] = fixtures.INPUT_OVERRIDE_CONTAINER_CPU
    inputs['override-container-memory'] = fixtures.INPUT_OVERRIDE_CONTAINER_MEMORY
    inputs['override-container-memory-reservation'] = fixtures.INPUT_OVERRIDE_CONTAINER_MEMORY_RESERVATION
    inputs['timeout'] = fixtures.INPUT_TIMEOUT

    const [input, timeout] = inputHelper()

    expect(input.taskDefinition).toStrictEqual(fixtures.INPUT_TASK_DEFINITION)
    expect(input.cluster).toStrictEqual(fixtures.INPUT_CLUSTER)
    const awsvpcConfiguration = input.networkConfiguration?.awsvpcConfiguration
    expect(awsvpcConfiguration?.assignPublicIp).toStrictEqual(AssignPublicIp.DISABLED)
    expect(awsvpcConfiguration?.securityGroups).toStrictEqual(fixtures.INPUT_SECURITY_GROUPS)
    expect(awsvpcConfiguration?.subnets).toStrictEqual(fixtures.INPUT_SUBNETS)
    const containerOverride = input.overrides?.containerOverrides?.[0]
    expect(containerOverride?.name).toStrictEqual(fixtures.INPUT_OVERRIDE_CONTAINER_NAME)
    expect(containerOverride?.command).toStrictEqual(fixtures.INPUT_OVERRIDE_CONTAINER_COMMAND)
    expect(containerOverride?.environment).toStrictEqual(fixtures.PARSED_OVERRIDE_CONTAINER_ENVIRONMENT)
    expect(containerOverride?.cpu).toStrictEqual(fixtures.PARSED_OVERRIDE_CONTAINER_CPU)
    expect(containerOverride?.memory).toStrictEqual(fixtures.PARSED_OVERRIDE_CONTAINER_MEMORY)
    expect(containerOverride?.memoryReservation).toStrictEqual(fixtures.PARSED_OVERRIDE_CONTAINER_MEMORY_RESERVATION)
    expect(timeout).toStrictEqual(fixtures.PARSED_TIMEOUT)
  })

  it('do net set securityGroups when only subnets is set', () => {
    inputs['subnets'] = fixtures.INPUT_SUBNETS

    const [input] = inputHelper()

    const awsvpcConfiguration = input.networkConfiguration?.awsvpcConfiguration
    expect(awsvpcConfiguration?.securityGroups).toBeUndefined()
  })

  it('do not set subnets when only security-groups is set', () => {
    inputs['security-groups'] = fixtures.INPUT_SECURITY_GROUPS

    const [input] = inputHelper()

    const awsvpcConfiguration = input.networkConfiguration?.awsvpcConfiguration
    expect(awsvpcConfiguration?.subnets).toBeUndefined()
  })

  it('do not set subnets and securityGroups when only assign-public-ip is set', () => {
    inputs['assign-public-ip'] = fixtures.INPUT_ASSIGN_PUBLIC_IP

    const [input] = inputHelper()

    const awsvpcConfiguration = input.networkConfiguration?.awsvpcConfiguration
    expect(awsvpcConfiguration?.securityGroups).toBeUndefined()
    expect(awsvpcConfiguration?.subnets).toBeUndefined()
  })

  it('enables public IP assignment when assign-public-ip is set', () => {
    inputs['assign-public-ip'] = true

    const [input] = inputHelper()

    const awsvpcConfiguration = input.networkConfiguration?.awsvpcConfiguration
    expect(awsvpcConfiguration?.assignPublicIp).toStrictEqual(AssignPublicIp.ENABLED)
  })

  it('override-container: throws an error when name is missing and command is set', () => {
    inputs['override-container-command'] = fixtures.INPUT_OVERRIDE_CONTAINER_COMMAND

    expect(() => inputHelper()).toThrowError()
  })

  it('override-container: throws an error when name is missing and environment is set', () => {
    inputs['override-container-environment'] = fixtures.INPUT_OVERRIDE_CONTAINER_ENVIRONMENT

    expect(() => inputHelper()).toThrowError()
  })

  it('override-container: throws an error when name is missing and cpu is set', () => {
    inputs['override-container-cpu'] = fixtures.INPUT_OVERRIDE_CONTAINER_CPU

    expect(() => inputHelper()).toThrowError()
  })

  it('override-container: throws an error when name is missing and memory is set', () => {
    inputs['override-container-memory'] = fixtures.INPUT_OVERRIDE_CONTAINER_MEMORY

    expect(() => inputHelper()).toThrowError()
  })

  it('override-container: throws an error when name is missing and memory-reservation is set', () => {
    inputs['override-container-memory-reservation'] = fixtures.INPUT_OVERRIDE_CONTAINER_MEMORY_RESERVATION

    expect(() => inputHelper()).toThrowError()
  })

  it('override-container-command: parses correctly when containing spaces', () => {
    inputs['override-container-name'] = fixtures.INPUT_OVERRIDE_CONTAINER_NAME
    inputs['override-container-command'] = [' command  \t', ' \r ', '  \n --long   ', '\n']

    const [input] = inputHelper()

    const received = input.overrides?.containerOverrides?.[0]?.command
    expect(received).toStrictEqual(['command', '--long'])
  })

  it('override-container-environment: parses correctly when valid (simple)', () => {
    inputs['override-container-name'] = fixtures.INPUT_OVERRIDE_CONTAINER_NAME
    inputs['override-container-environment'] = ['NAME = VALUE']

    const [input] = inputHelper()

    const received = input.overrides?.containerOverrides?.[0]?.environment
    expect(received).toStrictEqual([{name: 'NAME', value: 'VALUE'}])
  })

  it('override-container-environment: parses correctly when valid (spaces)', () => {
    inputs['override-container-name'] = fixtures.INPUT_OVERRIDE_CONTAINER_NAME
    inputs['override-container-environment'] = [' NAME =     \tVALUE\t    \t']

    const [input] = inputHelper()

    const received = input.overrides?.containerOverrides?.[0]?.environment
    expect(received).toStrictEqual([{name: 'NAME', value: 'VALUE'}])
  })

  it('override-container-environment: throws an error when invalid', () => {
    inputs['override-container-name'] = fixtures.INPUT_OVERRIDE_CONTAINER_NAME
    inputs['override-container-environment'] = [' NAME = VALUE=VALUE=VALUE']

    expect(() => inputHelper()).toThrowError()
  })
})

describe('getNumberInput tests', () => {
  it('returns a number when input is valid', () => {
    inputs['test'] = '1000'
    expect(getNumberInput('test')).toEqual(1000)
  })

  it('returns NaN when input is empty and optional', () => {
    inputs['test'] = ''
    expect(getNumberInput('test')).toBe(NaN)
  })

  it('throws an error when input is empty and required', () => {
    inputs['test'] = ''
    expect(() => getNumberInput('test', {required: true})).toThrowError()
  })

  it('throws an error when input is invalid and optional', () => {
    inputs['test'] = 'stop war'
    expect(() => getNumberInput('test')).toThrowError()
  })
})
