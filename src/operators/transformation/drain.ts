import { Channel, FlattenChannel } from '@Lib/channel/channel.types';
import { createAsyncWrapper } from '@Lib/shared/utils/createAsyncWrapper';
import { iterate } from './iterate';

export async function drain<C extends Channel<any>>(ch: C) {
    return (async () => {
        const values: FlattenChannel<C>[] = [];
        await createAsyncWrapper(iterate)(function accumulate(data) {
            values.push(data);
        }, ch);
        return values;
    })();
}
