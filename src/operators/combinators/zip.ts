/* eslint-disable no-loop-func */
import { FlattenChannels } from '@Lib/channel/entity/flatten';
import { Channel } from '@Lib/channel/entity/channel';
import { call } from '@Lib/go/instructions/call';
import { createAsyncWrapper } from '@Lib/shared/utils/createAsyncWrapper';
import { all } from './all';
import { take } from '../core/take';

function* zipGenerator<Channels extends Channel<any>[]>(
    callback: (data: readonly FlattenChannels<Channels>[]) => any,
    ...chs: Channels
) {
    let output: FlattenChannels<Channels>[] = Array(chs.length);
    while (chs.some((ch) => !ch.isClosed)) {
        yield all(
            ...chs.map((ch, i) => {
                return call(function* takeValue() {
                    output[i] = yield take(ch);
                });
            }),
        );
        callback(output);
        output = Array(chs.length);
    }
}

export const zip = createAsyncWrapper(zipGenerator);
