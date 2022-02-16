export type { Channel } from './entity/channel';
export type { ChannelConfiguration } from './entity/channelConfiguration';
export type { FlattenChannel, FlattenChannels } from './entity/flatten';
export { errorMessages } from './entity/errorMessages';
export { Events } from './entity/events';

export { isChannelClosedError } from './utils/isChannelClosedError';
export { makePutRequest } from './utils/makePutRequest';
export { makeTakeRequest } from './utils/makeTakeRequest';
export { releaseTake } from './utils/releaseTake';
export { releasePut } from './utils/releasePut';
export { resetChannel } from './utils/resetChannel';
export { isPutBlocked } from './utils/isPutBlocked';
export { isChannelClosed } from './utils/isChannelClosed';
export { hasValues } from './utils/hasValues';
export { waitForIncomingPut } from './utils/waitForIncomingPut';
export { waitForIncomingTake } from './utils/waitForIncomingTake';
export { waitForPutQueueToRelease } from './utils/waitForPutQueueToRelease';
export { waitForTakeQueueToRelease } from './utils/waitForTakeQueueToRelease';
export { waitUntilBufferEmpty } from './utils/waitUntilBufferEmpty';
export { waitUntilBufferIsEmptyAsync } from './utils/waitUntilBufferEmptyAsync';
export { pop } from './utils/pop';
export { push } from './utils/push';
export { close } from './utils/close';

// eslint-disable-next-line import/no-cycle
export { closeOnAllValuesTaken } from './proxy/closeOnAllValuesTaken';
export { closeOnEmptyBuffer } from './proxy/closeOnEmptyBuffer';

export { DefaultChannelConfig } from './config';

// eslint-disable-next-line import/no-cycle
export { makeChannel, makeTimeoutChannel } from './channel';
