import { CreatableBufferType } from '@Lib/buffer';
import { makeChannel, close, Channel, resetChannel } from '@Lib/channel';
import { Values } from '@Lib/channel/entity/privateKeys';
import { makeMix, toggle, Mixer } from '@Lib/mix';
import { putAsync, takeAsync } from '@Lib/operators';
import { delay } from '@Lib/shared/utils';

describe('mixer', () => {
    describe('when channels are added to mix in normal mode', () => {
        let destCh: Channel<any>;
        let mixedCh1: Channel<any>;
        let mixedCh2: Channel<any>;
        let mixer: Mixer;

        beforeEach(async () => {
            destCh = makeChannel(CreatableBufferType.UNBLOCKING, 0, 'dest');

            mixedCh1 = makeChannel(
                CreatableBufferType.UNBLOCKING,
                1,
                'mixed-1',
            );
            mixedCh2 = makeChannel(
                CreatableBufferType.UNBLOCKING,
                1,
                'mixed-2',
            );

            mixer = makeMix(destCh);
            await toggle(mixer, mixedCh1);
            await toggle(mixer, mixedCh2);
        });

        afterEach(() => {
            resetChannel(destCh);
            resetChannel(mixedCh1);
            resetChannel(mixedCh2);
        });

        afterAll(async () => {
            close(destCh);
            close(mixedCh1);
            close(mixedCh2);
        });

        it('it should supply values from mixed channels to destination', async () => {
            await putAsync(mixedCh1, 'test1');
            await putAsync(mixedCh2, 'test2');

            expect(await takeAsync(destCh)).toEqual('test1');
            expect(await takeAsync(destCh)).toEqual('test2');
        });

        /* TODO: Seems more like a Toggle test */
        describe('when adding same channel to the mix again', () => {
            it('should stop previous channel consumption and start consuming again', async () => {
                await toggle(mixer, mixedCh2);
                await putAsync(mixedCh2, 'noop');
                expect(await takeAsync(destCh)).toEqual('noop');
                close(destCh);
                close(mixedCh1);
                close(mixedCh2);
            });
        });
    });

    describe('when adding channel in pasue mode', () => {
        it('should not consume added channel', async () => {
            const destCh = makeChannel(
                CreatableBufferType.UNBLOCKING,
                0,
                'dest',
            );

            const mixedCh1 = makeChannel(
                CreatableBufferType.UNBLOCKING,
                1,
                'mixed-1',
            );

            const mixer = makeMix(destCh);
            toggle(mixer, mixedCh1, 'pause');

            await putAsync(mixedCh1, 'test1');
            await delay(300);
            expect(mixedCh1[Values]).toEqual(['test1']);
            expect(destCh[Values]).toEqual([]);
        });
    });

    describe('when adding channel in mute mode', () => {
        it('should consume mixed channels but not supply values to destination', async () => {
            const destCh = makeChannel(
                CreatableBufferType.UNBLOCKING,
                0,
                'dest',
            );

            const mixedCh1 = makeChannel(
                CreatableBufferType.UNBLOCKING,
                1,
                'mixed-1',
            );

            const mixer = makeMix(destCh);

            toggle(mixer, mixedCh1, 'mute');
            await putAsync(mixedCh1, 'test1');
            await delay(500);
            expect(destCh[Values]).toEqual([]);
            expect(mixedCh1[Values]).toEqual([]);
            close(destCh);
            close(mixedCh1);
        });
    });

    describe('when adding channel in solo mode', () => {
        describe('when mix solo mode is mute', () => {
            it('should mute other non-solo mixed channels', async () => {
                const spy = jest.fn();
                const destCh = makeChannel(
                    CreatableBufferType.UNBLOCKING,
                    0,
                    'dest',
                );

                const mixedCh1 = makeChannel(
                    CreatableBufferType.UNBLOCKING,
                    1,
                    'mixed-1',
                );

                const mixedCh2 = makeChannel(
                    CreatableBufferType.UNBLOCKING,
                    1,
                    'mixed-2',
                );

                const mixer = makeMix(destCh, 'mute');
                await toggle(mixer, mixedCh1);
                await toggle(mixer, mixedCh2, 'solo');

                expect(mixer.mixedChannelsMap['mixed-1'].mode).toEqual('mute');

                await putAsync(mixedCh1, 'test1');
                const takePromise = takeAsync(destCh).then(spy);
                await delay(100);
                expect(spy).not.toHaveBeenCalled();
                await putAsync(mixedCh2, 'test2');
                await delay(500);
                await takePromise;
                expect(spy).toHaveBeenCalledWith('test2');
                close(mixedCh1);
                close(mixedCh2);
            });

            it('should not mute other solo mixed channels', async () => {
                const destCh = makeChannel(
                    CreatableBufferType.UNBLOCKING,
                    0,
                    'dest',
                );

                const mixedCh1 = makeChannel(
                    CreatableBufferType.UNBLOCKING,
                    1,
                    'mixed-1',
                );

                const mixedCh2 = makeChannel(
                    CreatableBufferType.UNBLOCKING,
                    1,
                    'mixed-2',
                );
                const mixer = makeMix(destCh);
                await toggle(mixer, mixedCh1, 'solo');
                await toggle(mixer, mixedCh2, 'solo');
                await putAsync(mixedCh1, 'test1');
                expect(await takeAsync(destCh)).toEqual('test1');
                await putAsync(mixedCh2, 'test2');
                expect(await takeAsync(destCh)).toEqual('test2');
                close(destCh);
                close(mixedCh1);
                close(mixedCh2);
            });
        });

        describe('when mix solo mode is pause', () => {
            it('should pause other non-solo mixed channels', async () => {
                const destCh = makeChannel(
                    CreatableBufferType.UNBLOCKING,
                    0,
                    'dest',
                );

                const mixedCh1 = makeChannel(
                    CreatableBufferType.UNBLOCKING,
                    1,
                    'mixed-1',
                );

                const mixedCh2 = makeChannel(
                    CreatableBufferType.UNBLOCKING,
                    1,
                    'mixed-2',
                );

                const mixer = makeMix(destCh, 'pause');
                await toggle(mixer, mixedCh1);
                await toggle(mixer, mixedCh2, 'solo');
                await putAsync(mixedCh1, 'test1');
                await putAsync(mixedCh2, 'test2');
                expect(await takeAsync(destCh)).toEqual('test2');
                expect(mixedCh1[Values]).toEqual(['test1']);
                close(destCh);
                close(mixedCh1);
                close(mixedCh2);
            });

            it('should not pause other solo mixed channels', async () => {
                const destCh = makeChannel(
                    CreatableBufferType.UNBLOCKING,
                    0,
                    'dest',
                );

                const mixedCh1 = makeChannel(
                    CreatableBufferType.UNBLOCKING,
                    1,
                    'mixed-1',
                );

                const mixedCh2 = makeChannel(
                    CreatableBufferType.UNBLOCKING,
                    1,
                    'mixed-2',
                );
                const mixer = makeMix(destCh, 'pause');
                await toggle(mixer, mixedCh1, 'solo');
                await toggle(mixer, mixedCh2, 'solo');
                await putAsync(mixedCh1, 'test1');
                expect(await takeAsync(destCh)).toEqual('test1');
                await putAsync(mixedCh2, 'test2');
                expect(await takeAsync(destCh)).toEqual('test2');
                close(destCh);
                close(mixedCh1);
                close(mixedCh2);
            });
        });
    });

    it('should toggle channel modes', async () => {
        const destCh = makeChannel(CreatableBufferType.UNBLOCKING, 0, 'dest');

        const mixedCh1 = makeChannel(
            CreatableBufferType.UNBLOCKING,
            1,
            'mixed-1',
        );
        const mixedCh2 = makeChannel(
            CreatableBufferType.UNBLOCKING,
            1,
            'mixed-2',
        );
        const mixer = makeMix(destCh);
        await toggle(mixer, mixedCh1);
        await toggle(mixer, mixedCh2);

        await toggle(mixer, mixedCh1, 'pause');
        await putAsync(mixedCh1, 'test1');
        await delay(300);
        expect(mixedCh1[Values]).toEqual(['test1']);
        expect(destCh[Values]).toEqual([]);

        await toggle(mixer, mixedCh1, 'mute');
        await putAsync(mixedCh1, 'test1');
        await delay(300);
        expect(mixedCh1[Values]).toEqual([]);
        expect(destCh[Values]).toEqual([]);

        await toggle(mixer, mixedCh1, 'solo');
        await putAsync(mixedCh2, 'test2');
        await putAsync(mixedCh1, 'test1');
        expect(await takeAsync(destCh)).toEqual('test1');
        expect(mixedCh2[Values]).toEqual([]);
        expect(mixedCh1[Values]).toEqual([]);

        close(destCh);
        close(mixedCh1);
        close(mixedCh2);
    });
});
