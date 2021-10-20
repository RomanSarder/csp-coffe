// takes an array consists of channels or [ch, valueToPut]
// tries to immediately do an operation like poll/offer
// if succeeds and priority is false - return the first one
// if succeeds and priority is true and multiple results ready - return in order
// if no operations ready
// if default value provided - return it
// if no default value - wait for operations, return first one to succeed

import { FlattenChannel, Channel } from '@Lib/channel';
import { eventLoopQueue } from '@Lib/internal';
import { Flatten } from '@Lib/shared';
import { offer, poll } from '.';
import { raceToSuccess } from './shared/utils';

type PutDefinition<C extends Channel<any>> = [C, FlattenChannel<C>];

type ArrayOfDefinitions<C extends Channel<any>> = (PutDefinition<C> | C)[];

type DefinitionType<A extends any[], C = Flatten<A>> = C extends
    | PutDefinition<infer U>
    | infer U
    ? FlattenChannel<U> | null
    : unknown;

type OperationResponse<C extends any> = {
    value: C | true;
    channel: Channel<NonNullable<C>>;
};

type OperationResponseWithDefaultValue<C extends any> = {
    value: C | true;
    channel: Channel<NonNullable<C>> | null;
};

function isPutDefinition<C extends Channel<any>>(
    def: C | PutDefinition<C>,
): def is PutDefinition<C> {
    if (def instanceof Array && typeof def[0] === 'object') {
        return true;
    }
    return false;
}

export function alts<
    Definitions extends ArrayOfDefinitions<Channel<any>>,
    InnerType = DefinitionType<Definitions>,
>(defs: Definitions): Promise<OperationResponse<InnerType>>;

export function alts<
    Definitions extends ArrayOfDefinitions<Channel<any>>,
    DefaultValue extends DefinitionType<Definitions>,
    InnerType = DefinitionType<Definitions>,
>(
    defs: Definitions,
    defaultValue: DefaultValue,
): Promise<OperationResponseWithDefaultValue<NonNullable<InnerType>>>;

export async function alts<
    Definitions extends ArrayOfDefinitions<Channel<any>>,
    InnerType = DefinitionType<Definitions>,
>(
    defs: Definitions,
    defaultValue?: InnerType,
): Promise<
    OperationResponse<InnerType> | OperationResponseWithDefaultValue<InnerType>
> {
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

    if (defaultValue) {
        return { channel: null, value: defaultValue };
    }
    let operationResult: OperationResponse<InnerType>;
    const promises: Promise<OperationResponse<InnerType>>[] = defs.map(
        async (def) => {
            if (isPutDefinition(def)) {
                const [ch, data] = def;
                while (operationResult === undefined) {
                    await eventLoopQueue();
                    const maybeResult = offer(ch, data);
                    if (maybeResult !== null) {
                        operationResult = {
                            value: maybeResult,
                            channel: ch,
                        };
                    }
                }
                return operationResult;
            }
            while (operationResult === undefined) {
                await eventLoopQueue();
                const maybeResult = poll(def);
                if (maybeResult !== null) {
                    operationResult = {
                        value: maybeResult,
                        channel: def,
                    };
                }
            }
            return operationResult;
        },
    );
    return raceToSuccess(promises);
}
