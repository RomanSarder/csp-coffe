import type { Channel } from '@Lib/channel';
import { putRequest } from '../config';
import { PutBuffer } from '../entity/privateKeys';

export function makePutRequest(ch: Channel<any>) {
    ch[PutBuffer].add(putRequest);
}
