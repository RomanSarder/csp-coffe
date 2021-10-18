// takes an array consists of channels or [ch, valueToPut]
// tries to immediately do an operation like poll/offer
// if succeeds and priority is false - return the first one
// if succeeds and priority is true and multiple results ready - return in order
// if no operations ready
// if default value provided - return it
// if no default value - wait for operations, return first one to succeed

import { FlattenChannel, Channel } from '@Lib/channel';
import { Flatten } from '@Lib/shared';
import { offer, poll, put, take } from '.';
import { raceToSuccess } from './shared/utils';

type PutDefinition<C extends Channel<any>> = [C, FlattenChannel<C>];

type ArrayOfDefinitions<C extends Channel<any>> = (PutDefinition<C> | C)[];

type DefinitionType<A extends any[], C = Flatten<A>> = C extends
    | PutDefinition<infer U>
    | infer U
    ? FlattenChannel<U> | null
    : unknown;

type OperationResponse<C extends NonNullable<any>> = {
    value: C | true;
    channel: Channel<any>;
};

function isPutDefinition<C extends Channel<any>>(
    def: C | PutDefinition<C>,
): def is PutDefinition<C> {
    if (def instanceof Array && typeof def[1] === 'object') {
        return true;
    }
    return false;
}

export async function alts<
    Definitions extends ArrayOfDefinitions<Channel<any>>,
    InnerType = DefinitionType<Definitions>,
>(defs: Definitions): Promise<OperationResponse<InnerType>> {
    const successes: OperationResponse<InnerType>[] = [];

    defs.forEach((def) => {
        if (isPutDefinition(def)) {
            const [ch, data] = def;
            const result = offer(ch, data);

            if (result !== null) {
                successes.push({ value: result, channel: ch });
            }
        } else {
            const ch = def;
            const result = poll(ch);

            if (result !== null) {
                successes.push({ value: result, channel: ch });
            }
        }
    });

    if (successes.length > 0) {
        return successes[0];
    }

    const promises: Promise<OperationResponse<InnerType>>[] = defs.map(
        async (def) => {
            if (isPutDefinition(def)) {
                const [ch, data] = def;
                return put(ch, data);
            }
            return take(def);
        },
    );

    return raceToSuccess(promises);
}
