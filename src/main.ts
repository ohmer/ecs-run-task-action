import {setFailed} from '@actions/core'
import {inputHelper} from './input-helper'
import {runTask} from './run-task'

export async function main(): Promise<void> {
  try {
    const [input, timeout] = inputHelper()
    await runTask(input, timeout)
  } catch (error) {
    if (error instanceof Error) setFailed(error.message)
  }
}

if (require.main === module) {
  await main()
}
