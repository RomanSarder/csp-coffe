type PromisesType<P> = P extends Promise<infer T>[] ? T : unknown;

export function raceToSuccess<P extends Promise<any>[]>(
    promises: P,
): Promise<PromisesType<P>> {
    return Promise.all(
        promises.map((promise) => {
            return promise
                .then((res) => {
                    throw new Error(res);
                })
                .catch((e) => {
                    return e;
                });
        }),
    ).catch((res) => {
        return res;
    });
}
