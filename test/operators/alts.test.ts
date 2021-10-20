import { CreatableBufferType } from '@Lib/buffer';
import { makeChannel } from '@Lib/channel';
import { eventLoopQueue } from '@Lib/internal';
import { alts } from '@Lib/operators';
// import { makePut, releasePut } from '@Lib/operators/internal';
import { makePut } from '@Lib/operators/internal';

describe('alts', () => {
    describe('when given only channels', () => {
        describe('when any channel has value available immediately', () => {
            // it('should return value from first channel with available value', async () => {
            //     const ch1 = makeChannel<string>();
            //     const ch2 = makeChannel<number>();
            //     makePut(ch2, 10);
            //     const result = await alts([ch1, ch2]);
            //     expect(result.value).toEqual(10);
            //     expect(result.channel.is(ch2)).toEqual(true);
            // });
        });

        describe('when no channel has value available immediately', () => {
            it('should for wait value to be available', async () => {
                const ch1 = makeChannel<string>();
                const ch2 = makeChannel<number>(CreatableBufferType.FIXED);
                const spy = jest.fn();

                alts([ch1, ch2]).then(spy);

                await eventLoopQueue();

                expect(spy).not.toHaveBeenCalled();

                await eventLoopQueue();

                makePut(ch1, 'test1');

                await eventLoopQueue();
                await eventLoopQueue();

                expect(spy).toHaveBeenCalledWith({
                    value: 'test1',
                    channel: ch1,
                });
            });

            // describe('when given default value', () => {
            //     it('should return default value', async () => {
            //         const ch1 = makeChannel<string>();
            //         const ch2 = makeChannel<number>(CreatableBufferType.FIXED);

            //         const result = await alts([ch1, ch2], 'test1');
            //         expect(result).toEqual({
            //             value: 'test1',
            //             channel: null,
            //         });
            //     });
            // });
        });
    });
    // describe('when given only put definitions', () => {
    //     describe('when any channel has space in buffer immediately', () => {
    //         it('should put value into the channel with buffer space', async () => {
    //             const ch1 = makeChannel<string>();
    //             const ch2 = makeChannel<number>();
    //             makePut(ch2, 10);

    //             const result = await alts([
    //                 [ch1, 'test1'],
    //                 [ch2, 10],
    //             ]);
    //             expect(result.value).toEqual(true);
    //             expect(result.channel.is(ch1)).toEqual(true);
    //         });
    //     });

    //     describe('when no channel as space in buffer immediately', () => {
    //         it('should wait until any operation succeeds', async () => {
    //             const ch1 = makeChannel<string>();
    //             const ch2 = makeChannel<number>(CreatableBufferType.FIXED, 2);
    //             const spy = jest.fn();
    //             makePut(ch2, 10);
    //             makePut(ch2, 30);
    //             makePut(ch1, 'test1');

    //             alts([
    //                 [ch1, 'test2'],
    //                 [ch2, 20],
    //             ]).then((res) => {
    //                 spy(res);
    //             });

    //             await eventLoopQueue();

    //             expect(spy).not.toHaveBeenCalled();

    //             await eventLoopQueue();

    //             releasePut(ch2);
    //             releasePut(ch2);

    //             await eventLoopQueue();

    //             expect(spy).toHaveBeenCalledWith({ value: true, channel: ch2 });
    //         });

    //         describe('when given default value', () => {
    //             it('should return default value', async () => {
    //                 const ch1 = makeChannel<string>();
    //                 const ch2 = makeChannel<number>();

    //                 makePut(ch1, 'filler');
    //                 makePut(ch2, 100);

    //                 const result = await alts(
    //                     [
    //                         [ch1, 'test1'],
    //                         [ch2, 'test2'],
    //                     ],
    //                     'test3',
    //                 );
    //                 expect(result).toEqual({
    //                     value: 'test3',
    //                     channel: null,
    //                 });
    //             });
    //         });
    //     });
    // });
});
