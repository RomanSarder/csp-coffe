import { FlattenChannel } from '@Lib/channel/entity/flatten';
import { Channel } from '@Lib/channel/entity/channel';
import { createAsyncWrapper } from '@Lib/shared/utils/createAsyncWrapper';
import { iterate } from './iterate';
import { constant } from '@Lib/shared/utils';

export async function drain<C extends Channel<any>>(ch: C) {
    return (async () => {
        const values: FlattenChannel<C>[] = [];
        await createAsyncWrapper(iterate)(
            function accumulate(data) {
                values.push(data);
            },
            constant(true),
            ch,
        );
        return values;
    })();
}
