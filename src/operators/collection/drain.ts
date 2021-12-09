import type { FlattenChannel, Channel } from '@Lib/channel';
import { createAsyncWrapper } from '@Lib/runner';
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
