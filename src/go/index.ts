export type { CallInstruction } from './entity/callInstruction';
export type { ForkInstruction } from './entity/forkInstruction';
export type { SpawnInstruction } from './entity/spawnInstruction';
export type { Instruction } from './entity/instruction';
export { InstructionType } from './entity/instructionType';
export { Events } from './entity/events';

export { call } from './instructions/call';
export { fork } from './instructions/fork';
export { spawn } from './instructions/spawn';

export { isInstruction } from './utils/isInstruction';
export * from './go';
